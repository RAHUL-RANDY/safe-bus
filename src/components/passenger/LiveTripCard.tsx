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
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#6366f1", "#22d3ee", "#a855f7", "#10b981"],
    });
    onEndTrip();
  };

  const nextStopName = bus?.nextStop || "Next Transit Hub";
  const etaMinutes = bus?.etaMinutes || 5;
  const speed = bus?.speed || 40;

  return (
    <div
      className="w-full relative overflow-hidden rounded-3xl animate-slide-up"
      style={{
        background: "rgba(255,255,255,0.045)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.08) inset",
      }}
    >
      {/* Top shimmer gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.7) 30%, rgba(34,211,238,0.5) 70%, transparent 100%)",
        }}
      />

      {/* Background orb */}
      <div
        className="absolute -top-20 -right-20 w-52 h-52 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="p-5 relative z-10">

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white relative overflow-hidden flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #6366f1, #22d3ee)",
                boxShadow: "0 0 20px rgba(99,102,241,0.45)",
              }}
            >
              <Navigation className="w-4.5 h-4.5 animate-pulse" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.2), transparent)" }} />
            </div>
            <div>
              <div
                className="text-[9px] font-bold uppercase tracking-widest mb-0.5"
                style={{
                  background: "linear-gradient(90deg, #a5b4fc, #22d3ee)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                ● Active Journey
              </div>
              <h3 className="text-sm font-bold text-white leading-tight">{trip.routeName}</h3>
            </div>
          </div>

          <div
            className="text-right px-2.5 py-1.5 rounded-xl"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: "#64748b", fontFamily: "JetBrains Mono, monospace" }}>
              BUS UNIT
            </div>
            <div className="text-xs font-bold text-white" style={{ fontFamily: "JetBrains Mono, monospace" }}>
              {trip.busId}
            </div>
          </div>
        </div>

        {/* ── Telemetry Grid ── */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {[
            {
              icon: Clock,
              label: "ETA",
              value: etaMinutes,
              unit: "min",
              sub: nextStopName,
              accent: "#22d3ee",
              glow: "rgba(34,211,238,0.2)",
            },
            {
              icon: Gauge,
              label: "Speed",
              value: speed,
              unit: "km/h",
              sub: "Normal",
              accent: "#a5b4fc",
              glow: "rgba(99,102,241,0.2)",
            },
            {
              icon: User,
              label: "Seat",
              value: trip.seatNumber || "14B",
              unit: "",
              sub: trip.passengerName,
              accent: "#fcd34d",
              glow: "rgba(252,211,77,0.2)",
            },
          ].map(({ icon: Icon, label, value, unit, sub, accent, glow }) => (
            <div
              key={label}
              className="rounded-2xl p-3 text-center relative overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: `0 0 20px ${glow}`,
              }}
            >
              <div className="flex items-center justify-center gap-1 text-[9px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#64748b" }}>
                <Icon className="w-2.5 h-2.5" style={{ color: accent }} />
                {label}
              </div>
              <div className="text-xl font-black leading-none" style={{ color: accent, fontFamily: "JetBrains Mono, monospace" }}>
                {value}
                {unit && <span className="text-[10px] font-medium ml-0.5" style={{ color: "#64748b" }}>{unit}</span>}
              </div>
              <div className="text-[9px] mt-1 truncate" style={{ color: "#94a3b8" }}>{sub}</div>
              {/* glow orb */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-4 rounded-full"
                style={{ background: `${glow}`, filter: "blur(8px)" }}
              />
            </div>
          ))}
        </div>

        {/* ── Route Progress ── */}
        <div
          className="rounded-2xl p-3.5 mb-4"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center justify-between text-[11px] font-medium mb-2.5">
            <div className="flex items-center gap-1.5" style={{ color: "#94a3b8" }}>
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: "#10b981", boxShadow: "0 0 6px #10b981" }}
              />
              <span className="truncate max-w-[110px]">{trip.originStop}</span>
            </div>
            <ArrowRight className="w-3 h-3 flex-shrink-0" style={{ color: "#475569" }} />
            <div className="flex items-center gap-1.5 text-right" style={{ color: "#22d3ee" }}>
              <span className="truncate max-w-[110px]">{trip.destinationStop}</span>
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: "#f59e0b", boxShadow: "0 0 6px #f59e0b" }}
              />
            </div>
          </div>

          {/* Progress Bar */}
          <div
            className="relative h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <div
              className="absolute top-0 left-0 h-full w-2/3 rounded-full"
              style={{
                background: "linear-gradient(90deg, #10b981, #22d3ee, #6366f1)",
                boxShadow: "0 0 12px rgba(34,211,238,0.5)",
              }}
            />
            {/* Bus position dot */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white animate-pulse"
              style={{ left: "calc(66% - 6px)", background: "#22d3ee", boxShadow: "0 0 8px #22d3ee" }}
            />
          </div>
          <div className="flex justify-between text-[9px] mt-1.5" style={{ color: "#475569" }}>
            <span>START</span>
            <span className="font-bold" style={{ color: "#22d3ee", fontFamily: "JetBrains Mono, monospace" }}>67% COMPLETE</span>
            <span>END</span>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex flex-col gap-2">

          {/* AI + Camera row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenAssistant}
              className="py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all group active:scale-95"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(34,211,238,0.08))",
                border: "1px solid rgba(99,102,241,0.3)",
                color: "#a5b4fc",
              }}
            >
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0 group-hover:scale-110 transition" />
              <span>Nexus AI</span>
              <span
                className="ml-auto text-[9px] px-1.5 py-0.5 rounded font-bold"
                style={{ background: "rgba(34,211,238,0.15)", color: "#22d3ee", fontFamily: "JetBrains Mono, monospace" }}
              >
                Chat
              </span>
            </button>

            <button
              onClick={() => setIsCameraOpen(true)}
              className="py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all group active:scale-95"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                color: "#94a3b8",
              }}
            >
              <Camera className="w-3.5 h-3.5 flex-shrink-0 group-hover:scale-110 transition" />
              <span>Safety Cam</span>
              <span
                className="ml-auto text-[9px] px-1.5 py-0.5 rounded font-bold"
                style={{ background: "rgba(16,185,129,0.15)", color: "#34d399", fontFamily: "JetBrains Mono, monospace" }}
              >
                LIVE
              </span>
            </button>
          </div>

          {/* E-Ticket */}
          <button
            onClick={() => setIsTicketOpen(true)}
            className="w-full py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all group active:scale-[0.99]"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.10), rgba(168,85,247,0.07))",
              border: "1px solid rgba(99,102,241,0.22)",
              color: "#c4b5fd",
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(99,102,241,0.2)" }}
              >
                <Ticket className="w-3 h-3" />
              </div>
              <span>Digital Smart E-Ticket & Live QR</span>
            </div>
            <span
              className="text-[9px] px-2 py-0.5 rounded font-bold"
              style={{ background: "rgba(168,85,247,0.2)", color: "#c084fc", fontFamily: "JetBrains Mono, monospace" }}
            >
              Seat {trip.seatNumber}
            </span>
          </button>

          {/* 24h Privacy notice */}
          <div
            className="px-3 py-1.5 rounded-xl flex items-center justify-between text-[10px]"
            style={{
              background: "rgba(16,185,129,0.04)",
              border: "1px solid rgba(16,185,129,0.12)",
              color: "#64748b",
            }}
          >
            <span className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#34d399", boxShadow: "0 0 4px #34d399" }}
              />
              🔒 Encrypted · 24h Auto-Purge Active
            </span>
            <span style={{ color: "#22d3ee", fontFamily: "JetBrains Mono, monospace" }}>24h</span>
          </div>

          {/* SOS + End */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={onTriggerSOS}
              className="py-3 px-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
              style={
                isSosActive
                  ? {
                      background: "#dc2626",
                      color: "#fff",
                      border: "2px solid #f87171",
                      boxShadow: "0 0 30px rgba(239,68,68,0.7), 0 0 60px rgba(239,68,68,0.3)",
                      animation: "sos-pulse 1.4s ease infinite",
                    }
                  : {
                      background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                      color: "#fff",
                      border: "1px solid rgba(239,68,68,0.5)",
                      boxShadow: "0 0 20px rgba(239,68,68,0.35), 0 4px 14px rgba(0,0,0,0.5)",
                    }
              }
            >
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>{isSosActive ? "🚨 SOS ACTIVE" : "🚨 EMERGENCY SOS"}</span>
            </button>

            <button
              onClick={handleComplete}
              className="py-3 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "#94a3b8",
              }}
            >
              <CheckCircle className="w-4 h-4" style={{ color: "#34d399" }} />
              <span>End Journey</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        title="Live Passenger Safety Cam"
        subtitle={`Live feed from ${bus?.id || "BUS-42A"} · Seat ${trip.seatNumber}`}
        watermarkText={`SAFEBUS VERIFIED · ${trip.passengerName} · SEAT ${trip.seatNumber}`}
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
