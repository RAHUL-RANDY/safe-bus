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
  Play,
  RotateCcw,
  ArrowRight,
  ShieldAlert,
  Bus as BusIcon,
  Ticket,
  Activity,
  CheckCircle2,
  Lock,
  Radio,
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

      {/* Hero Guide & Role Portals Banner */}
      <section className="bg-slate-900 border-b border-slate-800 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {/* Header & Quick Action */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-600/20 text-blue-400 text-xs font-bold border border-blue-500/30 uppercase tracking-wider">
                  Public Transit Portal
                </span>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Fleet System Operational
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                SafeBus Nexus Management System
              </h1>
              <p className="text-sm text-slate-300">
                Unified public transport platform for passenger safety, driver cockpit telemetry, and 24/7 fleet command.
              </p>
            </div>

            {/* Top Quick Simulator Controls */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={runQuickDemoSequence}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Quick Test Ride</span>
              </button>

              <button
                onClick={() => handleTriggerSOS("sos", "Manual Test SOS Incident")}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Test SOS</span>
              </button>

              <button
                onClick={() => getSyncEngine().resetDemoData()}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 flex items-center gap-1.5 transition"
                title="Reset simulation data"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* 3 Prominent Role Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Passenger Portal */}
            <Link
              href="/passenger"
              className="p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/50 transition group flex flex-col justify-between gap-3 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <span className="text-xs text-blue-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Open App →
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Passenger Safety App</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Track bus GPS, view arrival stop ETAs, digital ticket QR code, and 1-tap SOS distress button.
                </p>
              </div>
            </Link>

            {/* 2. Driver Cockpit */}
            <Link
              href="/driver"
              className="p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 transition group flex flex-col justify-between gap-3 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
                  <BusIcon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-mono">
                    DRIVER ONLY
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Open Cockpit →
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Driver Cockpit Console</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Digital speedometer HUD, pneumatic door locks, passenger counter, and DMS fatigue camera.
                </p>
              </div>
            </Link>

            {/* 3. Fleet Command */}
            <Link
              href="/operator"
              className="p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 transition group flex flex-col justify-between gap-3 shadow-sm relative"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-mono">
                    ADMIN ONLY
                  </span>
                  <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Open Command →
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Fleet Operator Command</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live interactive route map, real 4-channel CCTV video surveillance, and emergency dispatch.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Dual-View Interactive Simulator */}
      <main className="flex-1 max-w-[1500px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT VIEW: PASSENGER APP (Clean Mobile Preview) */}
        <div className="xl:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[440px] flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Smartphone className="w-4 h-4 text-blue-400" />
                <span>Passenger Interface</span>
              </div>
              <Link
                href="/passenger"
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
              >
                <span>Full Page</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Clean Mobile Frame */}
            <div className="w-full rounded-3xl p-4 bg-slate-900 border border-slate-800 shadow-xl flex flex-col gap-4 relative min-h-[720px]">
              {currentTrip ? (
                <div className="flex flex-col gap-4">
                  {/* Passenger Map Tile */}
                  <div className="w-full h-48 rounded-2xl overflow-hidden border border-slate-800 shadow relative">
                    <InteractiveMap
                      buses={activeBus ? [activeBus] : []}
                      activeBusId={activeBus?.id}
                      alerts={alerts.filter((a) => a.tripId === currentTrip.tripId)}
                      focusLocation={activeBus?.currentLocation}
                      height="100%"
                    />
                    <div className="absolute top-2 left-2 z-[1000] bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 shadow">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
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
          {/* Header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <LayoutDashboard className="w-4 h-4 text-indigo-400" />
              <span>Fleet Operations Monitor</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Link
                href="/driver"
                className="text-xs text-slate-300 hover:text-white font-medium flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 transition"
              >
                <BusIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Driver Panel →</span>
              </Link>
              {openAlertsCount > 0 ? (
                <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-bold">
                  🚨 {openAlertsCount} Active SOS
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-semibold">
                  🟢 Normal Operations
                </span>
              )}
            </div>
          </div>

          {/* Operations Telemetry Status Strip */}
          <div className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-white font-bold">Bangalore Metro Corridor</span>
              <span className="text-slate-600">•</span>
              <span>{buses.length} Fleet Vehicles Active</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-blue-400 font-semibold">Avg Dispatch: ~1.8m</span>
              <span className="text-slate-600">•</span>
              <span className={openAlertsCount > 0 ? "text-red-400 font-bold" : "text-emerald-400"}>
                {openAlertsCount > 0 ? `🚨 ${openAlertsCount} Open SOS Alert` : "Zero Incident Queue"}
              </span>
            </div>
          </div>

          {/* Operator Big Map */}
          <div className="w-full h-[360px] rounded-2xl overflow-hidden border border-slate-800 shadow-md">
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

          {/* On-Board AI CCTV Surveillance */}
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
