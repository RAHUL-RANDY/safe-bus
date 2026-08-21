"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/common/Navbar";
import InteractiveMap from "@/components/common/InteractiveMap";
import DriverCockpitPanel from "@/components/driver/DriverCockpitPanel";
import { getSyncEngine } from "@/lib/sync-engine";
import { Bus, Alert, GeoLocation } from "@/types";
import { useAuth, DEMO_USERS } from "@/lib/auth-context";
import Link from "next/link";
import {
  Bus as BusIcon,
  Lock,
  Sparkles,
  KeyRound,
  BadgeCheck,
  ShieldAlert,
} from "lucide-react";

export default function DriverPage() {
  const { user, quickDemoLogin, login, isLoading: isAuthLoading } = useAuth();

  const [buses, setBuses] = useState<Bus[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<string>("BUS-42A");

  // Driver login form states
  const [driverEmail, setDriverEmail] = useState("suresh.kumar@safebus-pilot.in");
  const [driverPass, setDriverPass] = useState("password123");
  const [driverError, setDriverError] = useState("");
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

  const handleDriverFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setDriverError("");
    setIsVerifying(true);
    const res = await login(driverEmail, driverPass, "operator");
    setIsVerifying(false);
    if (!res.success) {
      setDriverError(res.error || "Invalid driver credentials.");
    }
  };

  const isAuthorizedDriver =
    user &&
    (user.role === "operator" ||
      user.role === "admin" ||
      (user as any).role === "driver" ||
      user.badgeId?.includes("PILOT"));

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Verifying Pilot Security Clearance...</p>
          </div>
        </div>
      </div>
    );
  }

  // Driver Access Gatekeeper (Restricted for Passengers)
  if (!isAuthorizedDriver || user?.role === "passenger") {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
            {/* Gate Icon */}
            <div className="w-14 h-14 rounded-2xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400 mx-auto mb-4 shadow">
              <Lock className="w-7 h-7" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950 text-amber-400 text-[11px] font-bold border border-amber-800 mb-3">
              <span>PILOT & DRIVER CLEARANCE REQUIRED</span>
            </div>

            <h1 className="text-xl font-bold text-white tracking-tight">
              Driver Cockpit Restricted Access
            </h1>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Vehicle accelerator telemetry, pneumatic door actuators, passenger capacity counters, and Driver Monitoring (DMS) cameras are restricted to certified Bus Pilots.
            </p>

            {/* Current user info */}
            {user && (
              <div className="mt-4 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <span>Logged in as: <b>{user.name}</b></span>
                <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 font-mono text-[10px] uppercase">
                  {user.role}
                </span>
              </div>
            )}

            {/* Quick 1-Click Driver Access */}
            <div className="mt-5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1-Click Pilot Authentication</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Test Pilot</span>
              </div>

              <button
                type="button"
                onClick={() => quickDemoLogin("driver")}
                className="w-full p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition flex items-center gap-2 justify-center font-bold text-emerald-300"
              >
                <span>🚍 Authenticate as Suresh Kumar (Pilot • Bus 42A)</span>
              </button>
            </div>

            {/* Driver Login Form */}
            <form onSubmit={handleDriverFormLogin} className="mt-4 space-y-3 text-left">
              {driverError && (
                <div className="p-2 rounded bg-red-950 border border-red-800 text-red-300 text-xs">
                  {driverError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Driver License / Badge ID
                </label>
                <input
                  type="text"
                  value={driverEmail}
                  onChange={(e) => setDriverEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Driver PIN Code
                </label>
                <input
                  type="password"
                  value={driverPass}
                  onChange={(e) => setDriverPass(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Authorize Pilot Console</span>
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

  const activeBus = buses.find((b) => b.id === selectedBusId) || buses[0] || {
    id: "BUS-42A",
    routeName: "Route 42A - Metro Tech Express",
    routeCode: "R-42A",
    plateNumber: "KA 01 F 8821",
    driverName: "Suresh Kumar",
    driverPhone: "+91 98450 12345",
    currentLocation: { lat: 12.9172, lng: 77.6228 },
    speed: 42,
    heading: 90,
    nextStop: "Silk Board Central Interchange",
    nextStopIndex: 3,
    etaMinutes: 5,
    occupancy: 28,
    capacity: 45,
    status: "on-route",
    lastUpdated: Date.now(),
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      {/* Pilot Clearance Verified Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <BadgeCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">
            Pilot Console Active: <b className="text-white">{user?.name}</b> ({user?.badgeId || "PILOT-42A"})
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
          VEHICLE TELEMATICS LINKED
        </span>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Driver Unit Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 shadow">
          <div className="flex items-center gap-2 text-xs">
            <BusIcon className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-slate-300">Vehicle Assigned:</span>
            <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono font-bold border border-blue-800">
              {activeBus.id} • {activeBus.plateNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Switch Bus:</span>
            <select
              value={selectedBusId}
              onChange={(e) => setSelectedBusId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id} ({b.plateNumber}) - {b.driverName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Route Map View */}
        <div className="w-full h-[260px] sm:h-[300px] rounded-2xl overflow-hidden border border-slate-800 shadow relative">
          <InteractiveMap
            buses={[activeBus]}
            activeBusId={activeBus.id}
            alerts={alerts.filter((a) => a.busId === activeBus.id)}
            focusLocation={activeBus.currentLocation}
            height="100%"
          />
          <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-700 text-xs font-mono text-slate-200 flex items-center gap-2 shadow">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Next Corridor Stop: {activeBus.nextStop}</span>
          </div>
        </div>

        {/* Cockpit Controls */}
        <DriverCockpitPanel bus={activeBus} />
      </main>
    </div>
  );
}
