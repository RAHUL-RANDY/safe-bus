"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/common/Navbar";
import InteractiveMap from "@/components/common/InteractiveMap";
import LiveAlertsFeed from "@/components/operator/LiveAlertsFeed";
import FleetListPanel from "@/components/operator/FleetListPanel";
import OnBoardCCTVFeed from "@/components/operator/OnBoardCCTVFeed";
import PassengerManifestModal from "@/components/common/PassengerManifestModal";
import { getSyncEngine } from "@/lib/sync-engine";
import { Bus, Alert, GeoLocation } from "@/types";
import { useAuth, DEMO_USERS } from "@/lib/auth-context";
import Link from "next/link";
import {
  ShieldAlert,
  Bus as BusIcon,
  Users,
  Clock,
  ShieldCheck,
  Lock,
  ArrowRight,
  Sparkles,
  KeyRound,
  BadgeCheck,
  UserCheck,
} from "lucide-react";

export default function OperatorPage() {
  const { user, quickDemoLogin, login, isLoading: isAuthLoading } = useAuth();

  const [buses, setBuses] = useState<Bus[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<string>("BUS-42A");
  const [focusLocation, setFocusLocation] = useState<GeoLocation | null>(null);
  const [isPassengerModalOpen, setIsPassengerModalOpen] = useState<boolean>(false);

  // Admin login form states for gatekeeper
  const [adminEmail, setAdminEmail] = useState("david.vance@safebus-nexus.gov");
  const [adminPass, setAdminPass] = useState("password123");
  const [adminError, setAdminError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const engine = getSyncEngine();

    const unsubBuses = engine.subscribeBuses((updatedBuses) => {
      setBuses(updatedBuses);
    });

    const unsubAlerts = engine.subscribeAlerts((updatedAlerts) => {
      setAlerts(updatedAlerts);
    });

    return () => {
      unsubBuses();
      unsubAlerts();
    };
  }, []);

  const handleAcknowledge = async (alertId: string) => {
    await getSyncEngine().acknowledgeAlert(
      alertId,
      "Operator dispatched nearest mobile patrol squad to bus location."
    );
  };

  const handleResolve = async (alertId: string) => {
    await getSyncEngine().resolveAlert(
      alertId,
      "Incident resolved. Passenger safety verified & patrol cleared."
    );
  };

  const handleSelectBus = (bus: Bus) => {
    setSelectedBusId(bus.id);
    setFocusLocation(bus.currentLocation);
  };

  const handleAdminFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    setIsVerifying(true);
    const res = await login(adminEmail, adminPass, "operator");
    setIsVerifying(false);
    if (!res.success) {
      setAdminError(res.error || "Invalid administrator credentials.");
    }
  };

  const totalPassengers = buses.reduce((acc, b) => acc + (b.occupancy || 0), 0);
  const openAlertsCount = alerts.filter((a) => a.status === "open").length;
  const isEmergencyActive = openAlertsCount > 0;
  const selectedBus = buses.find((b) => b.id === selectedBusId) || buses[0];

  // Role Verification Gate
  const isAuthorizedAdmin = user && (user.role === "admin" || user.role === "operator");

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Verifying Operator Security Clearance...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorizedAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
            {/* Gate Icon */}
            <div className="w-14 h-14 rounded-2xl bg-red-950 border border-red-800 flex items-center justify-center text-red-400 mx-auto mb-4 shadow">
              <Lock className="w-7 h-7" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950 text-red-400 text-[11px] font-bold border border-red-800 mb-3">
              <span>ADMIN & OPERATOR CLEARANCE REQUIRED</span>
            </div>

            <h1 className="text-xl font-bold text-white tracking-tight">
              Command Center Restricted Access
            </h1>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Live fleet CCTV camera streams, remote vehicle telemetry, and SOS emergency dispatch controls are strictly reserved for authorized Transit System Administrators and Fleet Dispatchers.
            </p>

            {/* Current user badge */}
            {user && (
              <div className="mt-4 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <span>Current Profile: <b>{user.name}</b></span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                  {user.role}
                </span>
              </div>
            )}

            {/* Quick 1-Click Admin Access */}
            <div className="mt-5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1-Click Admin Authentication</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Test Dispatcher</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => quickDemoLogin("operator")}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition flex items-center gap-1.5 justify-center font-medium"
                >
                  <span>👮‍♂️ Commander Vance</span>
                </button>
                <button
                  type="button"
                  onClick={() => quickDemoLogin("admin")}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition flex items-center gap-1.5 justify-center font-medium"
                >
                  <span>🛡️ Dr. Priya (Admin)</span>
                </button>
              </div>
            </div>

            {/* Admin Login Form */}
            <form onSubmit={handleAdminFormLogin} className="mt-4 space-y-3 text-left">
              {adminError && (
                <div className="p-2 rounded bg-red-950 border border-red-800 text-red-300 text-xs">
                  {adminError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Administrator Email / Badge ID
                </label>
                <input
                  type="text"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Security Passcode
                </label>
                <input
                  type="password"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Authorize Admin Clearance</span>
                  </>
                )}
              </button>
            </form>

            {/* Back link */}
            <div className="mt-4 pt-3 border-t border-slate-800 text-center">
              <Link
                href="/passenger"
                className="text-xs text-slate-400 hover:text-white transition"
              >
                Return to Passenger Safety App →
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      {/* Admin Clearance Verified Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <BadgeCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">
            Admin Clearance Verified: <b className="text-white">{user?.name}</b> ({user?.badgeId || "DISPATCH-ALPHA"})
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
          OPERATOR ROLE ACTIVE
        </span>
      </div>

      {/* Emergency Global Alert Banner */}
      {isEmergencyActive && (
        <div className="bg-red-600 text-white px-4 py-2 text-center text-xs font-bold tracking-wider flex items-center justify-center gap-2 shadow">
          <ShieldAlert className="w-4 h-4 animate-ping" />
          <span>
            CRITICAL: {openAlertsCount} ACTIVE SOS EMERGENCY INCIDENT(S) TRANSMITTING • IMMEDIATE OPERATOR INTERVENTION REQUIRED
          </span>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Operator KPI Summary Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3 shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-800 font-bold">
              <BusIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Fleet Active</div>
              <div className="text-xl font-black text-white font-mono">{buses.length} Units</div>
            </div>
          </div>

          <button
            onClick={() => setIsPassengerModalOpen(true)}
            className="p-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/50 flex items-center justify-between text-left shadow transition group cursor-pointer"
            title="Click to view full on-board passenger details"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-800 font-bold group-hover:scale-105 transition">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <span>Total Passengers</span>
                  <span className="text-[9px] text-blue-400 font-normal underline">View All →</span>
                </div>
                <div className="text-xl font-black text-white font-mono">{totalPassengers}</div>
              </div>
            </div>
            <span className="px-2 py-1 rounded-lg bg-blue-900/40 text-blue-300 text-[10px] font-bold border border-blue-800/60 hidden sm:inline">
              Open Manifest
            </span>
          </button>

          <div
            className={`p-4 rounded-xl border flex items-center gap-3 shadow transition ${
              isEmergencyActive
                ? "bg-red-950/60 border-red-600"
                : "bg-slate-900 border-slate-800"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isEmergencyActive
                  ? "bg-red-600 text-white"
                  : "bg-emerald-950 text-emerald-400 border border-emerald-800"
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Active SOS</div>
              <div
                className={`text-xl font-black font-mono ${
                  isEmergencyActive ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {openAlertsCount} Open
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3 shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-950 text-amber-400 flex items-center justify-center border border-amber-800 font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Avg Dispatch ETA</div>
              <div className="text-xl font-black text-amber-300 font-mono">1.8 mins</div>
            </div>
          </div>
        </div>

        {/* Main Grid: Map & Side Feeds */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Fleet Map */}
          <div className="lg:col-span-8 flex flex-col gap-4 h-[460px] sm:h-[520px] lg:h-[680px] rounded-2xl overflow-hidden border border-slate-800 shadow">
            <InteractiveMap
              buses={buses}
              activeBusId={selectedBusId}
              alerts={alerts}
              focusLocation={focusLocation}
              onBusSelect={handleSelectBus}
              height="100%"
            />
          </div>

          {/* Right Feeds Column: Live Alerts & Fleet Units */}
          <div className="lg:col-span-4 flex flex-col gap-5 h-[680px]">
            <div className="flex-1 min-h-[320px]">
              <LiveAlertsFeed
                alerts={alerts}
                onAcknowledge={handleAcknowledge}
                onResolve={handleResolve}
                onFocusAlertOnMap={(loc) => setFocusLocation(loc)}
              />
            </div>

            <div className="flex-1 min-h-[300px]">
              <FleetListPanel
                buses={buses}
                selectedBusId={selectedBusId}
                onSelectBus={handleSelectBus}
                onFocusBus={(loc) => setFocusLocation(loc)}
              />
            </div>
          </div>
        </div>

        {/* On-Board Live Camera & AI CCTV Surveillance Feed */}
        <div className="w-full">
          <OnBoardCCTVFeed
            bus={selectedBus}
            onFlagDriverDistraction={() => {
              getSyncEngine().triggerSOS({
                id: `alert-distract-${Date.now()}`,
                tripId: `trip-auto-${Date.now()}`,
                busId: selectedBusId,
                passengerName: "AI Vision Monitor",
                type: "speed_anomaly",
                location: selectedBus?.currentLocation || { lat: 12.9172, lng: 77.6228 },
                timestamp: Date.now(),
                status: "open",
                message: "AI Camera DMS flagged acute driver fatigue / gaze distraction.",
              });
            }}
          />
        </div>
      </main>

      <PassengerManifestModal
        isOpen={isPassengerModalOpen}
        onClose={() => setIsPassengerModalOpen(false)}
        buses={buses}
      />
    </div>
  );
}
