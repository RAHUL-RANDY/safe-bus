"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/common/Navbar";
import InteractiveMap from "@/components/common/InteractiveMap";
import PassengerCheckIn from "@/components/passenger/PassengerCheckIn";
import LiveTripCard from "@/components/passenger/LiveTripCard";
import EmergencyModal from "@/components/passenger/EmergencyModal";
import AIAssistantDrawer from "@/components/passenger/AIAssistantDrawer";
import LiveAlertsFeed from "@/components/operator/LiveAlertsFeed";
import FleetListPanel from "@/components/operator/FleetListPanel";
import OnBoardCCTVFeed from "@/components/operator/OnBoardCCTVFeed";
import { getSyncEngine } from "@/lib/sync-engine";
import { Bus, Trip, Alert, GeoLocation } from "@/types";
import Link from "next/link";
import {
  Smartphone,
  LayoutDashboard,
  Shield,
  Sparkles,
  Zap,
  Radio,
  Play,
  RotateCcw,
  ArrowRight,
  ShieldAlert,
  Bus as BusIcon,
  Lock,
  Clock,
  Camera,
  Activity,
  CheckCircle2,
} from "lucide-react";

export default function SplitDemoPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);

  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [selectedBusId, setSelectedBusId] = useState<string>("BUS-42A");
  const [operatorFocusLocation, setOperatorFocusLocation] = useState<GeoLocation | null>(null);

  useEffect(() => {
    const engine = getSyncEngine();

    const unsubBuses = engine.subscribeBuses((b) => setBuses(b));
    const unsubTrips = engine.subscribeTrips((t) => {
      setTrips(t);
      const active = t.find((trip) => trip.status === "active");
      setCurrentTrip(active || null);
    });
    const unsubAlerts = engine.subscribeAlerts((a) => setAlerts(a));

    return () => {
      unsubBuses();
      unsubTrips();
      unsubAlerts();
    };
  }, []);

  // Passenger Actions
  const handleStartTrip = async (tripData: Omit<Trip, "tripId" | "startedAt" | "currentLocation">) => {
    const engine = getSyncEngine();
    const newTrip: Trip = {
      ...tripData,
      tripId: `trip-${Date.now()}`,
      startedAt: Date.now(),
      currentLocation: { lat: 12.9172, lng: 77.6228 },
    };
    await engine.createTrip(newTrip);
  };

  const handleEndTrip = async () => {
    if (!currentTrip) return;
    await getSyncEngine().completeTrip(currentTrip.tripId);
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
      type,
      location: busUnit.currentLocation,
      timestamp: Date.now(),
      status: "open",
      message:
        customNote ||
        (type === "medical"
          ? "Medical emergency reported on board."
          : type === "harassment"
          ? "Safety / harassment incident reported on board."
          : type === "speed_anomaly"
          ? "Vehicle telematics speed limit exceeded."
          : "Emergency SOS triggered by passenger! Immediate intervention required."),
    };

    await engine.triggerSOS(newAlert);
  };

  const handleCancelSOS = async () => {
    const activeAlert = alerts.find(
      (a) => a.tripId === currentTrip?.tripId && a.status !== "resolved"
    );
    if (activeAlert) {
      await getSyncEngine().resolveAlert(activeAlert.id, "Resolved by passenger.");
      setIsSosModalOpen(false);
    }
  };

  // Operator Actions
  const handleAcknowledgeAlert = async (alertId: string) => {
    await getSyncEngine().acknowledgeAlert(
      alertId,
      "Operator dispatched patrol squad to bus GPS coordinate."
    );
  };

  const handleResolveAlert = async (alertId: string) => {
    await getSyncEngine().resolveAlert(
      alertId,
      "Incident confirmed safe and resolved."
    );
  };

  // Automated Quick Demo Flow Runner
  const runQuickDemoSequence = async () => {
    await handleStartTrip({
      passengerId: "demo-pass-1",
      passengerName: "Rahul Sharma",
      busId: "BUS-42A",
      routeCode: "42A",
      routeName: "Route 42A • Metro Tech Express",
      originStop: "Electronic City Phase 1",
      destinationStop: "Majestic City Railway Hub",
      seatNumber: "14B",
      status: "active",
      emergencyContact: {
        name: "Guardian",
        phone: "+91 98765 43210",
      },
    });

    setTimeout(async () => {
      await handleTriggerSOS("sos", "Automated Demo SOS Signal");
      setIsSosModalOpen(true);
    }, 1200);
  };

  const activeBus = buses.find((b) => b.id === currentTrip?.busId) || buses[0];
  const activeAlert = alerts.find(
    (a) => a.busId === activeBus?.id && a.status !== "resolved"
  );
  const openAlertsCount = alerts.filter((a) => a.status === "open").length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      {/* Hero Guide & Quick Test Bar */}
      <section className="bg-slate-900/90 border-b border-cyan-500/20 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          {/* Top Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-extrabold text-white">
                  SafeBus Nexus — Interactive System Control
                </h1>
                <p className="text-xs text-slate-300">
                  Real-time synchronized simulation across Passenger App, Driver Cockpit, and Fleet Command.
                </p>
              </div>
            </div>

            {/* Action Simulator Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={runQuickDemoSequence}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/25 transition active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>1-Click Test Flow</span>
              </button>

              <button
                onClick={() => handleTriggerSOS("sos", "Manual Test SOS Incident")}
                className="px-3 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-300 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span>Simulate SOS</span>
              </button>

              <button
                onClick={() => getSyncEngine().resetDemoData()}
                className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-white/10 flex items-center gap-1 transition"
                title="Reset simulation data"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* 3-Step Simple Guide Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <div>
                <div className="text-xs font-bold text-white">Board & Track Ride</div>
                <div className="text-[11px] text-slate-400">QR check-in, live stop ETAs, seat assignment</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <div>
                <div className="text-xs font-bold text-white">AI Vision & Safe Cam</div>
                <div className="text-[11px] text-slate-400">Live DMS, 4-channel CCTV, 1-tap SOS</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                3
              </div>
              <div>
                <div className="text-xs font-bold text-white">24h Auto-Purge Vault</div>
                <div className="text-[11px] text-slate-400">All footage permanently deleted 24h post-ride</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dual-View Split Container */}
      <main className="flex-1 max-w-[1500px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT VIEW: PASSENGER APP (Mobile Frame Representation) */}
        <div className="xl:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[440px] flex flex-col gap-3">
            {/* View Header Label */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
                <Smartphone className="w-4 h-4" />
                <span>Passenger Smartphone App</span>
              </div>
              <Link
                href="/passenger"
                className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-semibold flex items-center gap-1"
              >
                <span>Open Full Page</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Mobile Device Glass Frame */}
            <div className="w-full rounded-[36px] p-4 bg-slate-900/90 border-2 border-cyan-500/30 shadow-[0_0_40px_rgba(34,211,238,0.15)] flex flex-col gap-4 relative overflow-hidden min-h-[760px]">
              {/* Dynamic Island / Notch */}
              <div className="w-28 h-4 rounded-full bg-slate-950 mx-auto border border-white/10 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-cyan-500/80"></div>
              </div>

              {currentTrip ? (
                <div className="flex flex-col gap-4">
                  {/* Passenger Interactive Mini Map */}
                  <div className="w-full h-52 rounded-2xl overflow-hidden border border-white/10 shadow-lg relative">
                    <InteractiveMap
                      buses={activeBus ? [activeBus] : []}
                      activeBusId={activeBus?.id}
                      alerts={alerts.filter((a) => a.tripId === currentTrip.tripId)}
                      focusLocation={activeBus?.currentLocation}
                      height="100%"
                    />
                    <div className="absolute top-2 left-2 z-[1000] bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-mono text-cyan-300 flex items-center gap-1.5 shadow">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Next: {activeBus?.nextStop || "In Transit"}</span>
                    </div>
                  </div>

                  {/* Passenger Active Ride Card */}
                  <LiveTripCard
                    trip={currentTrip}
                    bus={activeBus}
                    onEndTrip={handleEndTrip}
                    onOpenAssistant={() => setIsAiDrawerOpen(true)}
                    onTriggerSOS={() => {
                      handleTriggerSOS("sos");
                      setIsSosModalOpen(true);
                    }}
                    isSosActive={Boolean(activeAlert)}
                  />
                </div>
              ) : (
                <PassengerCheckIn onStartTrip={handleStartTrip} />
              )}
            </div>
          </div>
        </div>

        {/* RIGHT VIEW: FLEET OPERATOR COMMAND CENTER */}
        <div className="xl:col-span-7 flex flex-col gap-4">
          {/* View Header Label */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <LayoutDashboard className="w-4 h-4 text-cyan-400" />
              <span>Fleet Operator Command Dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/driver"
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-white/10"
              >
                <BusIcon className="w-3.5 h-3.5" />
                <span>Driver Panel →</span>
              </Link>
              {openAlertsCount > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black animate-pulse">
                  🚨 {openAlertsCount} ACTIVE SOS
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  🟢 ALL CLEAR
                </span>
              )}
            </div>
          </div>

          {/* Operations Telemetry Status Strip */}
          <div className="px-4 py-2 rounded-2xl bg-slate-950/70 border border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-300 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-white font-bold">SafeBus Nexus Fleet Grid</span>
              <span className="text-slate-500">•</span>
              <span>{buses.length} Units Active</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-cyan-300 font-bold">Average Dispatch: ~1.8m</span>
              <span className="text-slate-500">•</span>
              <span className={openAlertsCount > 0 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                {openAlertsCount > 0 ? `🚨 ${openAlertsCount} Emergency Queue` : "🟢 Zero Incidents"}
              </span>
            </div>
          </div>

          {/* Operator Big Map */}
          <div className="w-full h-[380px] rounded-3xl overflow-hidden border border-white/15 shadow-2xl">
            <InteractiveMap
              buses={buses}
              activeBusId={selectedBusId}
              alerts={alerts}
              focusLocation={operatorFocusLocation}
              onBusSelect={(b) => setSelectedBusId(b.id)}
              height="100%"
            />
          </div>

          {/* Operator Dual Panels (Alerts & Fleet) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[350px]">
            <LiveAlertsFeed
              alerts={alerts}
              onAcknowledge={handleAcknowledgeAlert}
              onResolve={handleResolveAlert}
              onFocusAlertOnMap={(loc) => setOperatorFocusLocation(loc)}
            />

            <FleetListPanel
              buses={buses}
              selectedBusId={selectedBusId}
              onSelectBus={(b) => {
                setSelectedBusId(b.id);
                setOperatorFocusLocation(b.currentLocation);
              }}
              onFocusBus={(loc) => setOperatorFocusLocation(loc)}
            />
          </div>

          {/* On-Board AI CCTV Surveillance with Live Webcam Access & 24h Purge */}
          <OnBoardCCTVFeed
            bus={activeBus}
            onFlagDriverDistraction={() => {
              handleTriggerSOS("speed_anomaly", "AI Camera flagged acute driver fatigue / distraction.");
            }}
          />
        </div>
      </main>

      {/* Emergency Modal */}
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
