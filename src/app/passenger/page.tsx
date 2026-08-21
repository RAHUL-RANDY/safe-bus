"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/common/Navbar";
import InteractiveMap from "@/components/common/InteractiveMap";
import PassengerCheckIn from "@/components/passenger/PassengerCheckIn";
import LiveTripCard from "@/components/passenger/LiveTripCard";
import EmergencyModal from "@/components/passenger/EmergencyModal";
import AIAssistantDrawer from "@/components/passenger/AIAssistantDrawer";
import { getSyncEngine } from "@/lib/sync-engine";
import { Bus, Trip, Alert } from "@/types";
import { Shield, Sparkles, AlertTriangle, PhoneCall } from "lucide-react";

export default function PassengerPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);

  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  useEffect(() => {
    const engine = getSyncEngine();

    const unsubBuses = engine.subscribeBuses((updatedBuses) => {
      setBuses(updatedBuses);
    });

    const unsubTrips = engine.subscribeTrips((updatedTrips) => {
      setTrips(updatedTrips);
      const active = updatedTrips.find((t) => t.status === "active");
      setCurrentTrip(active || null);
    });

    const unsubAlerts = engine.subscribeAlerts((updatedAlerts) => {
      setAlerts(updatedAlerts);
    });

    return () => {
      unsubBuses();
      unsubTrips();
      unsubAlerts();
    };
  }, []);

  const handleStartTrip = async (
    tripData: Omit<Trip, "tripId" | "startedAt" | "currentLocation">
  ) => {
    const engine = getSyncEngine();
    const assignedBus = buses.find((b) => b.id === tripData.busId) || buses[0];

    const newTrip: Trip = {
      ...tripData,
      tripId: `trip-${Date.now()}`,
      startedAt: Date.now(),
      currentLocation: assignedBus.currentLocation,
    };

    await engine.createTrip(newTrip);
    setCurrentTrip(newTrip);
  };

  const handleEndTrip = async () => {
    if (currentTrip) {
      await getSyncEngine().completeTrip(currentTrip.tripId);
      setCurrentTrip(null);
    }
  };

  const handleTriggerSOS = async (
    type: Alert["type"] = "sos",
    customNote?: string
  ) => {
    const engine = getSyncEngine();
    const busUnit = buses.find((b) => b.id === (currentTrip?.busId || "BUS-42A")) || buses[0];

    const alertId = `alert-${Date.now()}`;
    const newAlert: Alert = {
      id: alertId,
      tripId: currentTrip?.tripId || `guest-${Date.now()}`,
      busId: busUnit.id,
      passengerName: currentTrip?.passengerName || "Rahul Sharma",
      type: type,
      location: busUnit.currentLocation,
      timestamp: Date.now(),
      status: "open",
      message: customNote || "Passenger initiated Emergency SOS trigger.",
    };

    await engine.triggerSOS(newAlert);
  };

  const handleCancelSOS = async () => {
    const activeAlert = alerts.find(
      (a) => a.tripId === currentTrip?.tripId && a.status !== "resolved"
    );
    if (activeAlert) {
      await getSyncEngine().resolveAlert(
        activeAlert.id,
        "Cancelled by passenger (False alarm/Safe)"
      );
      setIsSosModalOpen(false);
    }
  };

  const activeBus = buses.find((b) => b.id === currentTrip?.busId) || buses[0];
  const activeAlert = alerts.find(
    (a) => a.busId === activeBus?.id && a.status !== "resolved"
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Map & Live Movement */}
        <div className="lg:col-span-7 flex flex-col gap-4 h-[480px] sm:h-[540px] lg:h-[720px]">
          <InteractiveMap
            buses={buses}
            activeBusId={currentTrip?.busId || "BUS-42A"}
            alerts={alerts}
            height="100%"
          />
        </div>

        {/* Right Column: Passenger Actions & Telemetry HUD */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {!currentTrip ? (
            <PassengerCheckIn onStartTrip={handleStartTrip} />
          ) : (
            <div className="flex flex-col gap-5">
              <LiveTripCard
                trip={currentTrip}
                bus={activeBus}
                onEndTrip={handleEndTrip}
                onOpenAssistant={() => setIsAiDrawerOpen(true)}
                onTriggerSOS={() => setIsSosModalOpen(true)}
                isSosActive={Boolean(activeAlert)}
              />

              {/* Quick AI Assistance Card */}
              <div className="glass-panel p-4 rounded-3xl border border-cyan-500/20 flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Need Route Help?</h4>
                    <p className="text-[11px] text-slate-400">
                      Nexus AI is ready to answer questions about this trip
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAiDrawerOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition"
                >
                  Chat
                </button>
              </div>

              {/* Safety Protocol Banner */}
              <div className="glass-panel p-4 rounded-2xl border border-white/10 text-xs text-slate-300 flex items-center gap-3">
                <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>
                  <b>Safety Shield Active:</b> Your ride is supervised by automated speed anomaly detection & 24/7 operator dispatch.
                </span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* SOS Modal */}
      <EmergencyModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        onConfirmSOS={handleTriggerSOS}
        activeAlert={activeAlert}
        trip={currentTrip || undefined}
        bus={activeBus}
        onCancelSOS={handleCancelSOS}
      />

      {/* AI Assistant Chat Drawer */}
      <AIAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        trip={currentTrip || undefined}
        bus={activeBus}
      />
    </div>
  );
}
