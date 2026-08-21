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
import { Shield, Sparkles, Ticket } from "lucide-react";
import Link from "next/link";

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
        {/* Left Column: Interactive Map */}
        <div className="lg:col-span-7 flex flex-col gap-4 h-[440px] sm:h-[500px] lg:h-[680px] rounded-2xl overflow-hidden border border-slate-800 shadow-md">
          <InteractiveMap
            buses={buses}
            activeBusId={currentTrip?.busId || "BUS-42A"}
            alerts={alerts}
            height="100%"
          />
        </div>

        {/* Right Column: Passenger Actions */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {!currentTrip ? (
            <PassengerCheckIn onStartTrip={handleStartTrip} />
          ) : (
            <div className="flex flex-col gap-4">
              <LiveTripCard
                trip={currentTrip}
                bus={activeBus}
                onEndTrip={handleEndTrip}
                onOpenAssistant={() => setIsAiDrawerOpen(true)}
                onTriggerSOS={() => setIsSosModalOpen(true)}
                isSosActive={Boolean(activeAlert)}
              />

              {/* AI Assistance Card */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-800">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Route Questions?</h4>
                    <p className="text-xs text-slate-400">
                      Nexus AI is ready to help with ETAs and connections
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAiDrawerOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition"
                >
                  Ask AI
                </button>
              </div>

              {/* Safety Protocol Banner */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <b>Protected Ride:</b> Vehicle telematics connected to 24/7 Fleet Command.
                </span>
              </div>

              {/* Book Ticket / Pay Fare Fast Action */}
              <Link
                href="/ticket"
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 flex items-center justify-between shadow transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Book New Ticket / Pay Fare</h4>
                    <p className="text-xs text-slate-400">
                      Pay via UPI, Cards, or Metro SmartCard for instant QR pass
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-400 group-hover:translate-x-1 transition-transform">
                  Book →
                </span>
              </Link>
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
