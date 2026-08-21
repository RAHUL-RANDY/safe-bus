"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/common/Navbar";
import InteractiveMap from "@/components/common/InteractiveMap";
import LiveAlertsFeed from "@/components/operator/LiveAlertsFeed";
import FleetListPanel from "@/components/operator/FleetListPanel";
import OnBoardCCTVFeed from "@/components/operator/OnBoardCCTVFeed";
import { getSyncEngine } from "@/lib/sync-engine";
import { Bus, Alert, GeoLocation } from "@/types";
import {
  ShieldAlert,
  Bus as BusIcon,
  Users,
  Activity,
  Zap,
  Radio,
  Clock,
  ShieldCheck,
} from "lucide-react";

export default function OperatorPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<string>("BUS-42A");
  const [focusLocation, setFocusLocation] = useState<GeoLocation | null>(null);

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

  const totalPassengers = buses.reduce((acc, b) => acc + (b.occupancy || 0), 0);
  const openAlertsCount = alerts.filter((a) => a.status === "open").length;
  const isEmergencyActive = openAlertsCount > 0;
  const selectedBus = buses.find((b) => b.id === selectedBusId) || buses[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      {/* Emergency Global Alert Banner */}
      {isEmergencyActive && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white px-4 py-2 text-center text-xs font-black tracking-wider flex items-center justify-center gap-2 animate-pulse shadow-lg">
          <ShieldAlert className="w-4 h-4" />
          <span>
            URGENT: {openAlertsCount} ACTIVE SOS EMERGENCY INCIDENT(S) TRANSMITTING • IMMEDIATE OPERATOR DISPATCH REQUIRED
          </span>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Operator KPI Summary Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30">
              <BusIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Fleet Active</div>
              <div className="text-xl font-black text-white font-mono">{buses.length} Units</div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Passengers</div>
              <div className="text-xl font-black text-white font-mono">{totalPassengers}</div>
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border flex items-center gap-3 shadow-lg transition-all ${
              isEmergencyActive
                ? "glass-panel-danger border-red-500 animate-pulse"
                : "glass-panel border-white/10"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isEmergencyActive
                  ? "bg-red-600 text-white shadow-[0_0_15px_#EF4444]"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">SOS Alerts</div>
              <div
                className={`text-xl font-black font-mono ${
                  isEmergencyActive ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {openAlertsCount} Open
              </div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
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
          <div className="lg:col-span-8 flex flex-col gap-4 h-[500px] sm:h-[580px] lg:h-[720px]">
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
          <div className="lg:col-span-4 flex flex-col gap-6 h-[720px]">
            <div className="flex-1 min-h-[340px]">
              <LiveAlertsFeed
                alerts={alerts}
                onAcknowledge={handleAcknowledge}
                onResolve={handleResolve}
                onFocusAlertOnMap={(loc) => setFocusLocation(loc)}
              />
            </div>

            <div className="flex-1 min-h-[320px]">
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
    </div>
  );
}
