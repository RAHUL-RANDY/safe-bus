"use client";

import React, { useState, useEffect } from "react";
import { Alert, GeoLocation } from "@/types";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Radio,
  User,
  Navigation,
  ShieldCheck,
} from "lucide-react";

interface LiveAlertsFeedProps {
  alerts: Alert[];
  onAcknowledge: (alertId: string, notes?: string) => void;
  onResolve: (alertId: string, notes?: string) => void;
  onFocusAlertOnMap?: (location: GeoLocation) => void;
}

export default function LiveAlertsFeed({
  alerts,
  onAcknowledge,
  onResolve,
  onFocusAlertOnMap,
}: LiveAlertsFeedProps) {
  const openAlerts = alerts.filter((a) => a.status === "open");
  const ackAlerts = alerts.filter((a) => a.status === "acknowledged");
  const resolvedAlerts = alerts.filter((a) => a.status === "resolved");

  return (
    <div
      className="flex flex-col h-full relative overflow-hidden rounded-3xl"
      style={{
        background: "rgba(255,255,255,0.045)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(239,68,68,0.05) inset",
      }}
    >
      {/* Top shimmer */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: openAlerts.length > 0
            ? "linear-gradient(90deg, transparent, rgba(239,68,68,0.8), rgba(251,113,133,0.5), transparent)"
            : "linear-gradient(90deg, transparent, rgba(99,102,241,0.6), rgba(34,211,238,0.4), transparent)",
        }}
      />

      <div className="p-5 flex flex-col h-full">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 mb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center relative flex-shrink-0"
              style={
                openAlerts.length > 0
                  ? {
                      background: "rgba(220,38,38,0.2)",
                      border: "1px solid rgba(239,68,68,0.5)",
                      boxShadow: "0 0 20px rgba(239,68,68,0.4)",
                      color: "#f87171",
                      animation: "sos-pulse 1.4s ease infinite",
                    }
                  : {
                      background: "rgba(99,102,241,0.12)",
                      border: "1px solid rgba(99,102,241,0.3)",
                      color: "#a5b4fc",
                    }
              }
            >
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 leading-tight">
                Live Emergency Alerts
                {openAlerts.length > 0 && (
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-black"
                    style={{
                      background: "rgba(239,68,68,0.25)",
                      border: "1px solid rgba(239,68,68,0.45)",
                      color: "#fca5a5",
                      animation: "badge-sos-pulse 1s ease infinite",
                    }}
                  >
                    {openAlerts.length} CRITICAL
                  </span>
                )}
              </h3>
              <p className="text-[11px]" style={{ color: "#64748b" }}>Real-time SOS telemetry from active buses</p>
            </div>
          </div>

        </div>

        {/* Alerts Stream List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {openAlerts.length === 0 && ackAlerts.length === 0 && (
            <div
              className="h-48 flex flex-col items-center justify-center text-center p-6 rounded-2xl"
              style={{ background: "rgba(16,185,129,0.04)", border: "1px dashed rgba(16,185,129,0.2)" }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }}
              >
                <ShieldCheck className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-200">
                All Fleet Corridors Secure
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Zero active SOS emergency signals. Continuous AI monitoring active.
              </p>
            </div>
          )}


        {/* OPEN CRITICAL ALERTS */}
        {openAlerts.map((alert) => (
          <div
            key={alert.id}
            className="glass-panel-danger rounded-2xl p-4 border border-red-500/60 relative overflow-hidden shadow-xl animate-fade-in"
          >
            {/* Top flashing beacon line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-400 to-red-600 animate-pulse" />

            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <span className="text-xs font-black text-red-400 tracking-wider uppercase font-mono">
                  🚨 {alert.type.toUpperCase()} DISPATCH REQUIRED
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 my-2 text-xs bg-slate-950/70 p-2.5 rounded-xl border border-red-500/30">
              <div>
                <span className="text-slate-400 text-[10px]">Passenger:</span>
                <div className="font-bold text-white flex items-center gap-1">
                  <User className="w-3 h-3 text-cyan-400" />
                  <span>{alert.passengerName}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Bus Unit:</span>
                <div className="font-bold text-cyan-300 font-mono">{alert.busId}</div>
              </div>
              <div className="col-span-2 flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
                <span className="text-slate-400">GPS:</span>
                <span className="font-mono text-slate-200">
                  {alert.location?.lat.toFixed(5)}, {alert.location?.lng.toFixed(5)}
                </span>
              </div>
            </div>

            {alert.message && (
              <p className="text-xs text-rose-200 italic mb-3">
                &ldquo;{alert.message}&rdquo;
              </p>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              {onFocusAlertOnMap && (
                <button
                  onClick={() => onFocusAlertOnMap(alert.location)}
                  className="py-2 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1 border border-white/10"
                >
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  <span>Map Pin</span>
                </button>
              )}

              <button
                onClick={() => onAcknowledge(alert.id)}
                className="py-2 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center justify-center gap-1 transition"
              >
                <Clock className="w-3 h-3" />
                <span>Acknowledge</span>
              </button>

              <button
                onClick={() => onResolve(alert.id)}
                className="py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black flex items-center justify-center gap-1 shadow-lg shadow-emerald-600/30 transition"
              >
                <CheckCircle className="w-3 h-3" />
                <span>Resolve</span>
              </button>
            </div>
          </div>
        ))}

        {/* ACKNOWLEDGED ALERTS */}
        {ackAlerts.map((alert) => (
          <div
            key={alert.id}
            className="glass-panel rounded-2xl p-3.5 border border-amber-500/40 shadow-md"
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                ACKNOWLEDGED • IN PROGRESS
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="text-xs text-slate-300">
              <b>{alert.passengerName}</b> on <b>{alert.busId}</b>
            </div>

            {alert.operatorNotes && (
              <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg mt-1.5">
                {alert.operatorNotes}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 mt-2">
              {onFocusAlertOnMap && (
                <button
                  onClick={() => onFocusAlertOnMap(alert.location)}
                  className="py-1 px-2 rounded-lg bg-slate-900 text-slate-300 text-[10px] font-medium border border-white/10 flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  <span>View</span>
                </button>
              )}
              <button
                onClick={() => onResolve(alert.id)}
                className="py-1 px-3 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1"
              >
                <CheckCircle className="w-3 h-3" />
                <span>Mark Resolved</span>
              </button>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
