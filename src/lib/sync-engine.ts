import { db, isFirebaseConfigured } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import {
  supabase,
  isSupabaseConfigured,
  getSupabaseBuses,
  getSupabaseTrips,
  getSupabaseAlerts,
  upsertSupabaseBus,
  upsertSupabaseTrip,
  upsertSupabaseAlert,
} from "./supabase";
import { Bus, Trip, Alert, GeoLocation } from "@/types";
import { INITIAL_BUSES, ROUTE_COORDINATES, ROUTE_STOPS, calculateBearing } from "./route-data";

// Shared keys
const STORAGE_KEY_BUSES = "safebus_buses_v1";
const STORAGE_KEY_TRIPS = "safebus_trips_v1";
const STORAGE_KEY_ALERTS = "safebus_alerts_v1";
const CHANNEL_NAME = "safebus_nexus_realtime_v1";

type SyncEvent =
  | { type: "BUSES_UPDATE"; payload: Bus[] }
  | { type: "TRIP_UPDATE"; payload: Trip }
  | { type: "TRIP_COMPLETED"; payload: string }
  | { type: "ALERT_NEW"; payload: Alert }
  | { type: "ALERT_UPDATE"; payload: Alert }
  | { type: "RESET_ALL" };

class SyncEngine {
  private channel: BroadcastChannel | null = null;
  private busListeners: Set<(buses: Bus[]) => void> = new Set();
  private tripListeners: Set<(trips: Trip[]) => void> = new Set();
  private alertListeners: Set<(alerts: Alert[]) => void> = new Set();

  private buses: Bus[] = INITIAL_BUSES;
  private trips: Trip[] = [];
  private alerts: Alert[] = [];

  private simInterval: NodeJS.Timeout | null = null;
  private simPathIndex: number = 0;
  private isSimRunning: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.initLocalStorage();
      this.initBroadcastChannel();
      this.initFirestoreListeners();
      this.initSupabaseListeners();
      this.startGpsSimulation();
    }
  }

  private initLocalStorage() {
    try {
      const storedBuses = localStorage.getItem(STORAGE_KEY_BUSES);
      if (storedBuses) {
        this.buses = JSON.parse(storedBuses);
      } else {
        this.saveBuses(INITIAL_BUSES);
      }

      const storedTrips = localStorage.getItem(STORAGE_KEY_TRIPS);
      if (storedTrips) {
        this.trips = JSON.parse(storedTrips);
      }

      const storedAlerts = localStorage.getItem(STORAGE_KEY_ALERTS);
      if (storedAlerts) {
        this.alerts = JSON.parse(storedAlerts);
      }
    } catch (e) {
      console.warn("Local storage init error", e);
    }
  }

  private initBroadcastChannel() {
    if (typeof BroadcastChannel !== "undefined") {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event: MessageEvent<SyncEvent>) => {
        this.handleRemoteMessage(event.data);
      };
    }

    // Storage event for broader cross-tab sync fallback
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY_ALERTS && e.newValue) {
        this.alerts = JSON.parse(e.newValue);
        this.notifyAlerts();
      } else if (e.key === STORAGE_KEY_BUSES && e.newValue) {
        this.buses = JSON.parse(e.newValue);
        this.notifyBuses();
      } else if (e.key === STORAGE_KEY_TRIPS && e.newValue) {
        this.trips = JSON.parse(e.newValue);
        this.notifyTrips();
      }
    });
  }

  private handleRemoteMessage(msg: SyncEvent) {
    switch (msg.type) {
      case "BUSES_UPDATE":
        this.buses = msg.payload;
        this.notifyBuses();
        break;
      case "TRIP_UPDATE":
        const tIndex = this.trips.findIndex((t) => t.tripId === msg.payload.tripId);
        if (tIndex >= 0) {
          this.trips[tIndex] = msg.payload;
        } else {
          this.trips.unshift(msg.payload);
        }
        this.saveTrips(this.trips);
        this.notifyTrips();
        break;
      case "ALERT_NEW":
        if (!this.alerts.some((a) => a.id === msg.payload.id)) {
          this.alerts.unshift(msg.payload);
          this.saveAlerts(this.alerts);
          this.notifyAlerts();
        }
        break;
      case "ALERT_UPDATE":
        this.alerts = this.alerts.map((a) =>
          a.id === msg.payload.id ? msg.payload : a
        );
        this.saveAlerts(this.alerts);
        this.notifyAlerts();
        break;
      case "RESET_ALL":
        this.initLocalStorage();
        this.notifyBuses();
        this.notifyTrips();
        this.notifyAlerts();
        break;
    }
  }

  private broadcast(event: SyncEvent) {
    if (this.channel) {
      try {
        this.channel.postMessage(event);
      } catch (err) {
        console.warn("BroadcastChannel post error:", err);
      }
    }
  }

  // Real-time Firestore sync
  private initFirestoreListeners() {
    if (!isFirebaseConfigured() || !db) return;

    try {
      // Buses listener
      const busesRef = collection(db, "buses");
      onSnapshot(busesRef, (snapshot) => {
        if (!snapshot.empty) {
          const remoteBuses: Bus[] = [];
          snapshot.forEach((doc) => {
            remoteBuses.push({ id: doc.id, ...doc.data() } as Bus);
          });
          if (remoteBuses.length > 0) {
            this.buses = remoteBuses;
            this.saveBuses(this.buses);
            this.notifyBuses();
          }
        }
      });

      // Alerts listener
      const alertsRef = collection(db, "alerts");
      const alertsQuery = query(alertsRef, orderBy("timestamp", "desc"), limit(25));
      onSnapshot(alertsQuery, (snapshot) => {
        const remoteAlerts: Alert[] = [];
        snapshot.forEach((doc) => {
          remoteAlerts.push({ id: doc.id, ...doc.data() } as Alert);
        });
        if (remoteAlerts.length > 0) {
          this.alerts = remoteAlerts;
          this.saveAlerts(this.alerts);
          this.notifyAlerts();
        }
      });

      // Trips listener
      const tripsRef = collection(db, "trips");
      const tripsQuery = query(tripsRef, orderBy("startedAt", "desc"), limit(20));
      onSnapshot(tripsQuery, (snapshot) => {
        const remoteTrips: Trip[] = [];
        snapshot.forEach((doc) => {
          remoteTrips.push({ tripId: doc.id, ...doc.data() } as Trip);
        });
        if (remoteTrips.length > 0) {
          this.trips = remoteTrips;
          this.saveTrips(this.trips);
          this.notifyTrips();
        }
      });
    } catch (e) {
      console.warn("Firestore listeners initialization failed:", e);
    }
  }

  // Real-time Supabase sync
  private async initSupabaseListeners() {
    if (!isSupabaseConfigured() || !supabase) return;

    try {
      // Initial fetch from Supabase
      const [remoteBuses, remoteTrips, remoteAlerts] = await Promise.all([
        getSupabaseBuses(),
        getSupabaseTrips(),
        getSupabaseAlerts(),
      ]);

      if (remoteBuses && remoteBuses.length > 0) {
        this.buses = remoteBuses;
        this.saveBuses(this.buses);
        this.notifyBuses();
      }
      if (remoteTrips && remoteTrips.length > 0) {
        this.trips = remoteTrips;
        this.saveTrips(this.trips);
        this.notifyTrips();
      }
      if (remoteAlerts && remoteAlerts.length > 0) {
        this.alerts = remoteAlerts;
        this.saveAlerts(this.alerts);
        this.notifyAlerts();
      }

      // Realtime subscription via Supabase Channel
      supabase
        .channel("safebus_nexus_realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "buses" },
          (payload) => {
            if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
              const updatedBus = payload.new as Bus;
              const idx = this.buses.findIndex((b) => b.id === updatedBus.id);
              if (idx >= 0) {
                this.buses[idx] = updatedBus;
              } else {
                this.buses.push(updatedBus);
              }
              this.saveBuses(this.buses);
              this.notifyBuses();
            }
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "trips" },
          (payload) => {
            if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
              const updatedTrip = payload.new as Trip;
              const idx = this.trips.findIndex((t) => t.tripId === updatedTrip.tripId);
              if (idx >= 0) {
                this.trips[idx] = updatedTrip;
              } else {
                this.trips.unshift(updatedTrip);
              }
              this.saveTrips(this.trips);
              this.notifyTrips();
            }
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "alerts" },
          (payload) => {
            if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
              const updatedAlert = payload.new as Alert;
              const idx = this.alerts.findIndex((a) => a.id === updatedAlert.id);
              if (idx >= 0) {
                this.alerts[idx] = updatedAlert;
              } else {
                this.alerts.unshift(updatedAlert);
              }
              this.saveAlerts(this.alerts);
              this.notifyAlerts();
            }
          }
        )
        .subscribe();
    } catch (e) {
      console.warn("Supabase listeners initialization failed:", e);
    }
  }

  // Persistence helpers
  private saveBuses(buses: Bus[]) {
    this.buses = buses;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_BUSES, JSON.stringify(buses));
      } catch (e) {}
    }
  }

  private saveTrips(trips: Trip[]) {
    this.trips = trips;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_TRIPS, JSON.stringify(trips));
      } catch (e) {}
    }
  }

  private saveAlerts(alerts: Alert[]) {
    this.alerts = alerts;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(alerts));
      } catch (e) {}
    }
  }

  // Listeners
  public subscribeBuses(cb: (buses: Bus[]) => void): () => void {
    this.busListeners.add(cb);
    cb(this.buses);
    return () => this.busListeners.delete(cb);
  }

  public subscribeTrips(cb: (trips: Trip[]) => void): () => void {
    this.tripListeners.add(cb);
    cb(this.trips);
    return () => this.tripListeners.delete(cb);
  }

  public subscribeAlerts(cb: (alerts: Alert[]) => void): () => void {
    this.alertListeners.add(cb);
    cb(this.alerts);
    return () => this.alertListeners.delete(cb);
  }

  private notifyBuses() {
    this.busListeners.forEach((cb) => cb([...this.buses]));
  }
  private notifyTrips() {
    this.tripListeners.forEach((cb) => cb([...this.trips]));
  }
  private notifyAlerts() {
    this.alertListeners.forEach((cb) => cb([...this.alerts]));
  }

  // State actions
  public async createTrip(trip: Trip): Promise<Trip> {
    this.trips = [trip, ...this.trips.filter((t) => t.tripId !== trip.tripId)];
    this.saveTrips(this.trips);
    this.broadcast({ type: "TRIP_UPDATE", payload: trip });
    this.notifyTrips();

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, "trips", trip.tripId), trip);
      } catch (err) {
        console.warn("Firestore trip write error:", err);
      }
    }

    if (isSupabaseConfigured()) {
      await upsertSupabaseTrip(trip);
    }

    return trip;
  }

  public async completeTrip(tripId: string): Promise<void> {
    this.trips = this.trips.map((t) =>
      t.tripId === tripId
        ? { ...t, status: "completed" as const, completedAt: Date.now() }
        : t
    );
    this.saveTrips(this.trips);
    const updated = this.trips.find((t) => t.tripId === tripId);
    if (updated) {
      this.broadcast({ type: "TRIP_UPDATE", payload: updated });
    }
    this.notifyTrips();

    if (isFirebaseConfigured() && db) {
      try {
        await updateDoc(doc(db, "trips", tripId), {
          status: "completed",
          completedAt: Date.now(),
        });
      } catch (err) {
        console.warn("Firestore trip update error:", err);
      }
    }

    if (isSupabaseConfigured() && updated) {
      await upsertSupabaseTrip(updated);
    }

    if (typeof window !== "undefined") {
      try {
        const { getVideoRetentionEngine } = await import("./video-retention");
        getVideoRetentionEngine().onTripCompleted(tripId);
      } catch (e) {}
    }
  }

  public async triggerSOS(alert: Alert): Promise<Alert> {
    this.alerts = [alert, ...this.alerts.filter((a) => a.id !== alert.id)];
    this.saveAlerts(this.alerts);

    // Also update associated bus status to emergency
    this.buses = this.buses.map((b) =>
      b.id === alert.busId ? { ...b, status: "emergency" } : b
    );
    this.saveBuses(this.buses);
    this.broadcast({ type: "BUSES_UPDATE", payload: this.buses });
    this.notifyBuses();

    this.broadcast({ type: "ALERT_NEW", payload: alert });
    this.notifyAlerts();

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, "alerts", alert.id), alert);
        await updateDoc(doc(db, "buses", alert.busId), { status: "emergency" });
      } catch (err) {
        console.warn("Firestore SOS write error:", err);
      }
    }

    if (isSupabaseConfigured()) {
      await upsertSupabaseAlert(alert);
      const bus = this.buses.find((b) => b.id === alert.busId);
      if (bus) {
        await upsertSupabaseBus(bus);
      }
    }

    return alert;
  }

  public async acknowledgeAlert(alertId: string, operatorNotes = "Acknowledged by Operator. Dispatch team alerted."): Promise<void> {
    let targetAlert: Alert | null = null;
    this.alerts = this.alerts.map((a) => {
      if (a.id === alertId) {
        targetAlert = {
          ...a,
          status: "acknowledged",
          acknowledgedAt: Date.now(),
          operatorNotes,
        };
        return targetAlert;
      }
      return a;
    });

    this.saveAlerts(this.alerts);
    if (targetAlert) {
      this.broadcast({ type: "ALERT_UPDATE", payload: targetAlert });
    }
    this.notifyAlerts();

    if (isFirebaseConfigured() && db) {
      try {
        await updateDoc(doc(db, "alerts", alertId), {
          status: "acknowledged",
          acknowledgedAt: Date.now(),
          operatorNotes,
        });
      } catch (err) {
        console.warn("Firestore ack update error:", err);
      }
    }

    if (isSupabaseConfigured() && targetAlert) {
      await upsertSupabaseAlert(targetAlert);
    }
  }

  public async resolveAlert(alertId: string, operatorNotes = "Resolved. Passenger confirmed safe and bus resumed normal route."): Promise<void> {
    let targetAlert: Alert | null = null;
    let busIdToRestore: string | null = null;

    this.alerts = this.alerts.map((a) => {
      if (a.id === alertId) {
        busIdToRestore = a.busId;
        targetAlert = {
          ...a,
          status: "resolved",
          resolvedAt: Date.now(),
          operatorNotes,
        };
        return targetAlert;
      }
      return a;
    });

    if (busIdToRestore) {
      // Check if any other open alerts exist for this bus
      const otherOpen = this.alerts.some(
        (a) => a.busId === busIdToRestore && a.id !== alertId && a.status !== "resolved"
      );
      if (!otherOpen) {
        this.buses = this.buses.map((b) =>
          b.id === busIdToRestore ? { ...b, status: "on-route" } : b
        );
        this.saveBuses(this.buses);
        this.broadcast({ type: "BUSES_UPDATE", payload: this.buses });
        this.notifyBuses();
      }
    }

    this.saveAlerts(this.alerts);
    if (targetAlert) {
      this.broadcast({ type: "ALERT_UPDATE", payload: targetAlert });
    }
    this.notifyAlerts();

    if (isFirebaseConfigured() && db) {
      try {
        await updateDoc(doc(db, "alerts", alertId), {
          status: "resolved",
          resolvedAt: Date.now(),
          operatorNotes,
        });
        if (busIdToRestore) {
          await updateDoc(doc(db, "buses", busIdToRestore), { status: "on-route" });
        }
      } catch (err) {
        console.warn("Firestore resolve update error:", err);
      }
    }

    if (isSupabaseConfigured()) {
      if (targetAlert) {
        await upsertSupabaseAlert(targetAlert);
      }
      if (busIdToRestore) {
        const restoredBus = this.buses.find((b) => b.id === busIdToRestore);
        if (restoredBus) {
          await upsertSupabaseBus(restoredBus);
        }
      }
    }
  }

  // Autonomous GPS Route Simulation (3-5 second tick)
  public startGpsSimulation() {
    if (this.isSimRunning) return;
    this.isSimRunning = true;

    this.simInterval = setInterval(() => {
      this.tickGpsSimulation();
    }, 3200);
  }

  public stopGpsSimulation() {
    if (this.simInterval) {
      clearInterval(this.simInterval);
      this.simInterval = null;
    }
    this.isSimRunning = false;
  }

  private tickGpsSimulation() {
    const totalCoords = ROUTE_COORDINATES.length;
    this.simPathIndex = (this.simPathIndex + 1) % totalCoords;

    const currentCoord = ROUTE_COORDINATES[this.simPathIndex];
    const nextCoord = ROUTE_COORDINATES[(this.simPathIndex + 1) % totalCoords];
    const heading = Math.round(calculateBearing(currentCoord, nextCoord));

    // Dynamic speed with realistic traffic jitter
    const baseSpeed = 38 + Math.floor(Math.sin(this.simPathIndex) * 8);

    // Calculate which stop is next
    const stopIndex = Math.min(
      Math.floor((this.simPathIndex / totalCoords) * ROUTE_STOPS.length),
      ROUTE_STOPS.length - 1
    );
    const nextStop = ROUTE_STOPS[(stopIndex + 1) % ROUTE_STOPS.length];
    const etaMinutes = Math.max(1, 12 - (this.simPathIndex % 4) * 3);

    // Update BUS-42A
    this.buses = this.buses.map((bus) => {
      if (bus.id === "BUS-42A") {
        return {
          ...bus,
          currentLocation: currentCoord,
          heading,
          speed: baseSpeed,
          nextStop: nextStop.name,
          nextStopIndex: (stopIndex + 1) % ROUTE_STOPS.length,
          etaMinutes,
          lastUpdated: Date.now(),
        };
      }
      return bus;
    });

    // Update active trips on this bus
    this.trips = this.trips.map((trip) => {
      if (trip.busId === "BUS-42A" && trip.status === "active") {
        return {
          ...trip,
          currentLocation: currentCoord,
        };
      }
      return trip;
    });

    this.saveBuses(this.buses);
    this.saveTrips(this.trips);
    this.broadcast({ type: "BUSES_UPDATE", payload: this.buses });
    this.notifyBuses();
    this.notifyTrips();

    if (isFirebaseConfigured() && db) {
      try {
        const bus42 = this.buses.find((b) => b.id === "BUS-42A");
        if (bus42) {
          setDoc(doc(db, "buses", "BUS-42A"), bus42, { merge: true });
        }
      } catch (err) {
        // silent fallback
      }
    }

    if (isSupabaseConfigured()) {
      const bus42 = this.buses.find((b) => b.id === "BUS-42A");
      if (bus42) {
        upsertSupabaseBus(bus42);
      }
    }
  }

  public getBuses(): Bus[] {
    return this.buses;
  }
  public getTrips(): Trip[] {
    return this.trips;
  }
  public getAlerts(): Alert[] {
    return this.alerts;
  }

  public resetDemoData() {
    this.buses = INITIAL_BUSES;
    this.trips = [];
    this.alerts = [];
    this.simPathIndex = 0;
    this.saveBuses(this.buses);
    this.saveTrips(this.trips);
    this.saveAlerts(this.alerts);
    this.broadcast({ type: "RESET_ALL" });
    this.notifyBuses();
    this.notifyTrips();
    this.notifyAlerts();
  }
}

// Global Singleton
let syncEngineInstance: SyncEngine | null = null;

export function getSyncEngine(): SyncEngine {
  if (!syncEngineInstance) {
    syncEngineInstance = new SyncEngine();
  }
  return syncEngineInstance;
}
