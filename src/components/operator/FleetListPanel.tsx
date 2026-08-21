"use client";

import React from "react";
import { Bus, GeoLocation } from "@/types";
import {
  Bus as BusIcon,
  Navigation,
  Gauge,
  Users,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  MapPin,
  Clock,
  Camera,
} from "lucide-react";

interface FleetListPanelProps {
  buses: Bus[];
  selectedBusId: string;
  onSelectBus: (bus: Bus) => void;
  onFocusBus?: (loc: GeoLocation) => void;
}

export default function FleetListPanel({
  buses,
  selectedBusId,
  onSelectBus,
  onFocusBus,
}: FleetListPanelProps) {
  return (
    <div className="flex flex-col h-full glass-panel rounded-3xl p-5 border border-white/15 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_12px_rgba(34,211,238,0.3)]">
            <BusIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Live Fleet Units</h3>
            <p className="text-[11px] text-slate-400">
              {buses.length} Active Connected Vehicles
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
          Telemetry Active
        </span>
      </div>

      {/* Bus Cards List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {buses.map((bus) => {
          const isSelected = bus.id === selectedBusId;
          const isEmergency = bus.status === "emergency";

          return (
            <div
              key={bus.id}
              onClick={() => onSelectBus(bus)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                isEmergency
                  ? "glass-panel-danger border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse"
                  : isSelected
                  ? "bg-slate-900/90 border-cyan-400/60 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                  : "bg-slate-900/50 border-white/10 hover:bg-slate-900/80 hover:border-white/20"
              }`}
            >
              {/* Bus Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-mono">
                      {bus.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                        isEmergency
                          ? "bg-red-600 text-white animate-bounce"
                          : "bg-cyan-950/80 text-cyan-300 border border-cyan-500/30"
                      }`}
                    >
                      {isEmergency ? "🚨 SOS EMERGENCY" : bus.status}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-300 mt-0.5">
                    {bus.routeName}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-cyan-300 font-mono">
                    {bus.speed} <span className="text-[10px] text-slate-400 font-normal">km/h</span>
                  </div>
                </div>
              </div>

              {/* Driver & Telemetry Details */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/60 p-2.5 rounded-xl border border-white/5 my-2">
                <div>
                  <span className="text-slate-400">Driver:</span>
                  <div className="font-semibold text-slate-200 truncate">{bus.driverName}</div>
                </div>
                <div>
                  <span className="text-slate-400">Occupancy:</span>
                  <div className="font-semibold text-slate-200 flex items-center gap-1">
                    <Users className="w-3 h-3 text-cyan-400" />
                    <span>{bus.occupancy} / {bus.capacity}</span>
                  </div>
                </div>
                <div className="col-span-2 pt-1 border-t border-white/5 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-cyan-400" />
                    <span>Next: {bus.nextStop}</span>
                  </span>
                  <span className="text-amber-400 font-mono font-bold">
                    ETA: {bus.etaMinutes}m
                  </span>
                </div>
              </div>

              {/* Quick Actions Footer */}
              <div className="flex items-center justify-between mt-2 pt-1 text-[11px]">
                <span className="text-slate-400 font-mono text-[10px]">
                  Plate: {bus.plateNumber}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectBus(bus);
                    }}
                    className="px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 flex items-center gap-1 transition"
                    title="Watch On-Board Live CCTV"
                  >
                    <Camera className="w-3 h-3" />
                    <span>CCTV</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onFocusBus) onFocusBus(bus.currentLocation);
                      onSelectBus(bus);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 flex items-center gap-1 transition"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>Locate</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
