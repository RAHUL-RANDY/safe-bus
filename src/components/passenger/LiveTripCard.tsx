"use client";

import React, { useState } from "react";
import { Trip, Bus } from "@/types";
import CameraModal from "@/components/common/CameraModal";
import DigitalTicketModal from "@/components/passenger/DigitalTicketModal";
import {
  Navigation,
  MapPin,
  Clock,
  Gauge,
  User,
  ShieldCheck,
  CheckCircle,
  Sparkles,
  Camera,
  Ticket,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import confetti from "canvas-confetti";

interface LiveTripCardProps {
  trip: Trip;
  bus?: Bus;
  onEndTrip: () => void;
  onOpenAssistant: () => void;
  onTriggerSOS: () => void;
  isSosActive: boolean;
}

export default function LiveTripCard({
  trip,
  bus,
  onEndTrip,
  onOpenAssistant,
  onTriggerSOS,
  isSosActive,
}: LiveTripCardProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);

  const handleComplete = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    onEndTrip();
  };

  const nextStopName = bus?.nextStop || "Silk Board Interchange";
  const etaMinutes = bus?.etaMinutes || 5;
  const speed = bus?.speed || 42;

  return (
    <div className="w-full rounded-2xl bg-slate-900 border border-slate-800 shadow-lg p-5 flex flex-col gap-4">
      {/* Card Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              ● Active Passenger Trip
            </span>
            <h3 className="text-sm font-bold text-white">{trip.routeName}</h3>
          </div>
        </div>

        <div className="text-right px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Bus ID</div>
          <div className="text-xs font-bold text-white font-mono">{trip.busId}</div>
        </div>
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-xl p-3 bg-slate-950/70 border border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-slate-400 uppercase">
            <Clock className="w-3 h-3 text-blue-400" />
            <span>ETA</span>
          </div>
          <div className="text-xl font-black text-blue-400 mt-0.5 font-mono">
            {etaMinutes}<span className="text-xs font-normal text-slate-400 ml-0.5">m</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">{nextStopName}</div>
        </div>

        <div className="rounded-xl p-3 bg-slate-950/70 border border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-slate-400 uppercase">
            <Gauge className="w-3 h-3 text-emerald-400" />
            <span>Speed</span>
          </div>
          <div className="text-xl font-black text-emerald-400 mt-0.5 font-mono">
            {speed}<span className="text-xs font-normal text-slate-400 ml-0.5">km/h</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Normal Speed</div>
        </div>

        <div className="rounded-xl p-3 bg-slate-950/70 border border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-slate-400 uppercase">
            <User className="w-3 h-3 text-amber-400" />
            <span>Seat</span>
          </div>
          <div className="text-xl font-black text-amber-400 mt-0.5 font-mono">
            {trip.seatNumber || "14B"}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">{trip.passengerName}</div>
        </div>
      </div>

      {/* Route Progress */}
      <div className="rounded-xl p-3.5 bg-slate-950/60 border border-slate-800">
        <div className="flex items-center justify-between text-xs font-medium mb-2">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="truncate max-w-[120px]">{trip.originStop}</span>
          </div>
          <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
          <div className="flex items-center gap-1.5 text-blue-400">
            <span className="truncate max-w-[120px]">{trip.destinationStop}</span>
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          </div>
        </div>

        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
          <div className="h-full w-2/3 bg-blue-500 rounded-full"></div>
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-mono">
          <span>ORIGIN</span>
          <span className="text-blue-400 font-bold">67% COMPLETED</span>
          <span>TERMINAL</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5">
        {/* Top Actions Row */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenAssistant}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>AI Co-Pilot</span>
          </button>

          <button
            onClick={() => setIsCameraOpen(true)}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-2 transition"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Safety Camera</span>
          </button>
        </div>

        {/* Digital Ticket Button */}
        <button
          onClick={() => setIsTicketOpen(true)}
          className="w-full py-2.5 px-3.5 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 text-blue-200 border border-blue-800/80 text-xs font-bold flex items-center justify-between transition"
        >
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-blue-400" />
            <span>Digital Smart E-Ticket & QR</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-800/60 text-blue-300 font-mono">
            Seat {trip.seatNumber}
          </span>
        </button>

        {/* SOS and End Journey */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={onTriggerSOS}
            className={`py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow ${
              isSosActive
                ? "bg-red-600 text-white animate-pulse"
                : "bg-red-600 hover:bg-red-500 text-white"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{isSosActive ? "🚨 SOS TRANSMITTED" : "🚨 EMERGENCY SOS"}</span>
          </button>

          <button
            onClick={handleComplete}
            className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>End Journey</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        title="Live Bus CCTV Safety Feed"
        subtitle={`Live monitoring from ${bus?.id || "BUS-42A"} • Seat ${trip.seatNumber}`}
        watermarkText={`SAFEBUS VERIFIED • ${trip.passengerName} • SEAT ${trip.seatNumber}`}
        busId={trip.busId}
      />
      <DigitalTicketModal
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
        trip={trip}
        bus={bus}
      />
    </div>
  );
}
