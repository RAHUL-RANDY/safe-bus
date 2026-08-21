import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Bus, Trip, Alert, ChatMessage } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("http") &&
    !supabaseUrl.includes("your-project")
  );
}

const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "";

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

export const supabaseAdmin: SupabaseClient | null =
  typeof window === "undefined" && supabaseUrl && supabaseSecretKey
    ? createClient(supabaseUrl, supabaseSecretKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

// Supabase Database Table Helpers
export async function getSupabaseBuses(): Promise<Bus[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("buses")
      .select("*")
      .order("id", { ascending: true });
    if (error) throw error;
    return (data as Bus[]) || null;
  } catch (err) {
    console.warn("Supabase fetch buses error:", err);
    return null;
  }
}

export async function upsertSupabaseBus(bus: Bus): Promise<void> {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from("buses")
      .upsert(
        {
          id: bus.id,
          routeName: bus.routeName,
          routeCode: bus.routeCode,
          plateNumber: bus.plateNumber,
          driverName: bus.driverName,
          driverPhone: bus.driverPhone,
          currentLocation: bus.currentLocation,
          speed: bus.speed,
          heading: bus.heading,
          nextStop: bus.nextStop,
          nextStopIndex: bus.nextStopIndex,
          etaMinutes: bus.etaMinutes,
          occupancy: bus.occupancy,
          capacity: bus.capacity,
          status: bus.status,
          lastUpdated: bus.lastUpdated,
        },
        { onConflict: "id" }
      );
    if (error) throw error;
  } catch (err) {
    console.warn("Supabase upsert bus error:", err);
  }
}

export async function getSupabaseTrips(): Promise<Trip[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .order("startedAt", { ascending: false })
      .limit(20);
    if (error) throw error;
    return (data as Trip[]) || null;
  } catch (err) {
    console.warn("Supabase fetch trips error:", err);
    return null;
  }
}

export async function upsertSupabaseTrip(trip: Trip): Promise<void> {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from("trips")
      .upsert(
        {
          tripId: trip.tripId,
          passengerId: trip.passengerId,
          passengerName: trip.passengerName,
          busId: trip.busId,
          routeCode: trip.routeCode,
          routeName: trip.routeName,
          originStop: trip.originStop,
          destinationStop: trip.destinationStop,
          seatNumber: trip.seatNumber,
          status: trip.status,
          startedAt: trip.startedAt,
          completedAt: trip.completedAt,
          currentLocation: trip.currentLocation,
          emergencyContact: trip.emergencyContact,
        },
        { onConflict: "tripId" }
      );
    if (error) throw error;
  } catch (err) {
    console.warn("Supabase upsert trip error:", err);
  }
}

export async function getSupabaseAlerts(): Promise<Alert[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(30);
    if (error) throw error;
    return (data as Alert[]) || null;
  } catch (err) {
    console.warn("Supabase fetch alerts error:", err);
    return null;
  }
}

export async function upsertSupabaseAlert(alert: Alert): Promise<void> {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from("alerts")
      .upsert(
        {
          id: alert.id,
          tripId: alert.tripId,
          busId: alert.busId,
          passengerName: alert.passengerName,
          type: alert.type,
          location: alert.location,
          timestamp: alert.timestamp,
          status: alert.status,
          message: alert.message,
          acknowledgedAt: alert.acknowledgedAt,
          resolvedAt: alert.resolvedAt,
          operatorNotes: alert.operatorNotes,
        },
        { onConflict: "id" }
      );
    if (error) throw error;
  } catch (err) {
    console.warn("Supabase upsert alert error:", err);
  }
}

export async function logChatMessageToSupabase(message: ChatMessage, tripId?: string): Promise<void> {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from("chat_messages")
      .insert({
        id: message.id,
        trip_id: tripId || null,
        sender: message.sender,
        text: message.text,
        timestamp: message.timestamp,
        is_emergency: Boolean(message.isEmergencyRelated),
      });
    if (error) throw error;
  } catch (err) {
    console.warn("Supabase log chat message error:", err);
  }
}
