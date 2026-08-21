"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/common/Navbar";
import InteractiveMap from "@/components/common/InteractiveMap";
import DriverCockpitPanel from "@/components/driver/DriverCockpitPanel";
import { getSyncEngine } from "@/lib/sync-engine";
import { Bus, Alert, GeoLocation } from "@/types";
import { Bus as BusIcon } from "lucide-react";

export default function DriverPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<string>("BUS-42A");

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
