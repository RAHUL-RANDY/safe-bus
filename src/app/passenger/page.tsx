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

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Left Column: Interactive Map */}
        <div className="lg:col-span-7 flex flex-col gap-4 h-[380px] sm:h-[500px] lg:h-[680px] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800 shadow-lg relative">
          <InteractiveMap
            buses={buses}
            activeBusId={currentTrip?.busId || "BUS-42A"}
            alerts={alerts}
            height="100%"
          />

          {/* Mobile Overlay Quick SOS & AI Action Bar */}
          <div className="absolute top-3 right-3 sm:hidden flex items-center gap-2 z-[400]">
            <button
              onClick={() => setIsSosModalOpen(true)}
              className="px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold shadow-lg shadow-red-600/40 flex items-center gap-1.5 border border-red-400 animate-pulse"
              title="One-Tap Emergency SOS"
            >
              <span>🚨 SOS</span>
            </button>
            <button
              onClick={() => setIsAiDrawerOpen(true)}
              className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/40 flex items-center gap-1 border border-blue-400"
              title="Gemini AI Transit Assistant"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI</span>
            </button>
          </div>
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
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-800 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Route Questions?</h4>
                    <p className="text-[11px] text-slate-400">
                      Nexus AI is ready to help with ETAs and connections
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAiDrawerOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition shrink-0"
                >
                  Ask AI
                </button>
              </div>

              {/* Safety Protocol Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px] leading-relaxed">
                  <b>Protected Ride:</b> Vehicle telematics connected to 24/7 Fleet Command.
                </span>
              </div>

              {/* Book Ticket / Pay Fare Fast Action */}
              <Link
                href="/ticket"
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 flex items-center justify-between shadow transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800 shrink-0">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Book Ticket / Pay Fare</h4>
                    <p className="text-[11px] text-slate-400">
                      Pay via Razorpay, UPI, or SmartCard for instant QR pass
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-400 group-hover:translate-x-1 transition-transform shrink-0">
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
