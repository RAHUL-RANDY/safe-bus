"use client";

import React, { useState } from "react";
import { Bus, Trip } from "@/types";
import {
  Users,
  ShieldCheck,
  Wind,
  Thermometer,
  Sparkles,
  X,
  Lock,
  CheckCircle2,
  AlertCircle,
  Activity,
  Flame,
} from "lucide-react";

interface CabinHeatmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  bus?: Bus;
  currentSeat?: string;
}

export default function CabinHeatmapModal({
  isOpen,
  onClose,
  bus,
  currentSeat = "14B",
}: CabinHeatmapModalProps) {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(currentSeat);

  if (!isOpen) return null;

  // Generate 40-seat smart bus grid (10 rows x 4 seats with aisle)
  const rows = Array.from({ length: 10 }, (_, i) => i + 1);

  // Pre-seed occupied seats based on bus occupancy
  const occupiedSet = new Set([
    "1A", "1B", "2C", "3A", "3D", "4B", "5A", "5C", "6D", "7B", "8A", "8C", "9B", "10A", "10D",
    currentSeat,
  ]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900/95 border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.25)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  AI Smart Cabin & Crowd Density Heatmap
                </h3>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/30 font-bold">
                  LIVE SENSORS
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Real-time passenger seating distribution • Environmental air telemetry • Seat {currentSeat}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Environmental Cabin Telematics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-slate-950/70 border-b border-white/10 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/5 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400">Cabin Temp</div>
              <div className="font-mono font-bold text-white">22.4°C (Optimal)</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/5 flex items-center gap-2">
            <Wind className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400">Air Quality (AQI)</div>
              <div className="font-mono font-bold text-emerald-300">32 • Pure Filtered</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400">Seatbelts</div>
              <div className="font-mono font-bold text-cyan-300">92% Compliance</div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/5 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400">Density</div>
              <div className="font-mono font-bold text-white">
                {bus?.occupancy || 28} / {bus?.capacity || 45} Seats
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Cabin Layout */}
        <div className="p-5 flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center">
          {/* Bus Shell Container */}
          <div className="w-full max-w-md bg-slate-950 border-2 border-cyan-500/30 rounded-[32px] p-4 relative shadow-2xl">
            {/* Front Driver Cabin */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 px-2">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>PILOT COCKPIT [{bus?.driverName || "Driver Suresh"}]</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                DOOR CLOSED
              </span>
            </div>

            {/* Seats Grid */}
            <div className="space-y-2.5">
              {rows.map((rowNum) => {
                const seats = [
                  `${rowNum}A`,
                  `${rowNum}B`,
                  `${rowNum}C`,
                  `${rowNum}D`,
                ];

                return (
                  <div key={rowNum} className="flex items-center justify-between gap-2">
                    {/* Left 2 Seats (A, B) */}
                    <div className="flex gap-2">
                      {seats.slice(0, 2).map((seatId) => {
                        const isOccupied = occupiedSet.has(seatId);
                        const isCurrent = seatId === currentSeat;
                        const isSelected = seatId === selectedSeat;

                        return (
                          <button
                            key={seatId}
                            onClick={() => setSelectedSeat(seatId)}
                            className={`w-11 h-11 rounded-xl font-mono text-xs font-bold transition-all flex flex-col items-center justify-center relative ${
                              isCurrent
                                ? "bg-cyan-500 text-slate-950 shadow-[0_0_15px_#22D3EE] border-2 border-white scale-105"
                                : isOccupied
                                ? "bg-blue-900/60 border border-blue-500/40 text-blue-200"
                                : "bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-400"
                            } ${isSelected && !isCurrent ? "ring-2 ring-cyan-400" : ""}`}
                          >
                            <span>{seatId}</span>
                            {isCurrent && (
                              <span className="text-[8px] font-black uppercase leading-none">YOU</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Center Aisle Indicator */}
                    <div className="text-[9px] font-mono text-slate-600 tracking-widest px-1 select-none">
                      AISLE
                    </div>

                    {/* Right 2 Seats (C, D) */}
                    <div className="flex gap-2">
                      {seats.slice(2, 4).map((seatId) => {
                        const isOccupied = occupiedSet.has(seatId);
                        const isCurrent = seatId === currentSeat;
                        const isSelected = seatId === selectedSeat;

                        return (
                          <button
                            key={seatId}
                            onClick={() => setSelectedSeat(seatId)}
                            className={`w-11 h-11 rounded-xl font-mono text-xs font-bold transition-all flex flex-col items-center justify-center relative ${
                              isCurrent
                                ? "bg-cyan-500 text-slate-950 shadow-[0_0_15px_#22D3EE] border-2 border-white scale-105"
                                : isOccupied
                                ? "bg-blue-900/60 border border-blue-500/40 text-blue-200"
                                : "bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-400"
                            } ${isSelected && !isCurrent ? "ring-2 ring-cyan-400" : ""}`}
                          >
                            <span>{seatId}</span>
                            {isCurrent && (
                              <span className="text-[8px] font-black uppercase leading-none">YOU</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rear Emergency Exit */}
            <div className="mt-4 pt-3 border-t border-white/10 text-center text-[10px] font-mono text-emerald-400 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>REAR EMERGENCY PASSENGER STEP CLEAR</span>
            </div>
          </div>

          {/* Heatmap Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-cyan-500 border border-white"></div>
              <span className="text-slate-300">Your Seat ({currentSeat})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-blue-900/80 border border-blue-500/50"></div>
              <span className="text-slate-300">Occupied</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-slate-900 border border-white/20"></div>
              <span className="text-slate-400">Available</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/90 border-t border-white/10 flex items-center justify-between text-xs">
          <div className="text-slate-400">
            Selected Seat: <strong className="text-cyan-300 font-mono">{selectedSeat || currentSeat}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
          >
            Close Heatmap
          </button>
        </div>
      </div>
    </div>
  );
}
