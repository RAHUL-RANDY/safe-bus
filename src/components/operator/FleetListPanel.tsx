"use client";

import React from "react";
import { Bus, GeoLocation } from "@/types";
import {
  Bus as BusIcon,
  Navigation,
  Gauge,
  Users,
  MapPin,
  Clock,
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
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow">
            <BusIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Fleet Units</h3>
            <p className="text-xs text-slate-400">
              {buses.length} Active Connected Buses
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-emerald-950 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-800">
          Telemetry Synced
        </span>
      </div>

      {/* Bus Cards List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {buses.map((bus) => {
          const isSelected = bus.id === selectedBusId;
          const isEmergency = bus.status === "emergency";

          return (
            <div
              key={bus.id}
              onClick={() => onSelectBus(bus)}
              className={`p-3.5 rounded-xl border transition cursor-pointer ${
                isEmergency
                  ? "bg-red-950/60 border-red-600 shadow"
                  : isSelected
                  ? "bg-slate-950 border-blue-500 shadow"
                  : "bg-slate-950/60 border-slate-800 hover:bg-slate-950 hover:border-slate-700"
              }`}
            >
              {/* Bus Header */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-mono">
                      {bus.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        isEmergency
                          ? "bg-red-600 text-white"
                          : "bg-blue-950 text-blue-300 border border-blue-800"
                      }`}
                    >
                      {isEmergency ? "🚨 SOS ACTIVE" : bus.status}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-300 mt-0.5">
                    {bus.routeName}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-blue-400 font-mono">
                    {bus.speed} <span className="text-[10px] text-slate-400 font-normal">km/h</span>
                  </div>
                </div>
              </div>

              {/* Driver & Telemetry */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900 p-2 rounded-lg border border-slate-800 my-1.5">
                <div>
                  <span className="text-slate-400">Driver: </span>
                  <strong className="text-slate-200 font-medium">{bus.driverName}</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400">Occupancy: </span>
                  <strong className="text-blue-300 font-mono">
                    {bus.occupancy}/{bus.capacity}
                  </strong>
                </div>
              </div>

              {/* Next Stop & ETA */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-400" />
                  <span className="truncate max-w-[140px]">{bus.nextStop}</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-emerald-400">
                  <Clock className="w-3 h-3" />
                  <span>~{bus.etaMinutes}m ETA</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
