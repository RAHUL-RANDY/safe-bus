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
  Clock,
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

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3 shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-800 font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Passengers</div>
              <div className="text-xl font-black text-white font-mono">{totalPassengers}</div>
            </div>
          </div>

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
    </div>
  );
}
