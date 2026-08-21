"use client";

import React from "react";
import { Alert, GeoLocation } from "@/types";
import {
  ShieldAlert,
  CheckCircle,
  Clock,
  MapPin,
  User,
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

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              openAlerts.length > 0
                ? "bg-red-600 text-white animate-pulse"
                : "bg-blue-600 text-white"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Emergency Alerts</span>
              {openAlerts.length > 0 && (
                <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold">
                  {openAlerts.length} CRITICAL
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">Live Incident & Distress Queue</p>
          </div>
        </div>
      </div>

      {/* Alerts Stream List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {openAlerts.length === 0 && ackAlerts.length === 0 && (
          <div className="h-44 flex flex-col items-center justify-center text-center p-5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-emerald-950 text-emerald-400 border border-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-200">
              All Transit Corridors Clear
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Zero active SOS emergency signals. Automated 24/7 monitoring active.
            </p>
          </div>
        )}

        {/* OPEN CRITICAL ALERTS */}
        {openAlerts.map((alert) => (
          <div
            key={alert.id}
            className="rounded-xl p-4 bg-red-950/40 border border-red-600/80 shadow"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <span className="text-xs font-bold text-red-400 uppercase font-mono">
                  🚨 {alert.type.toUpperCase()} DISPATCH
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 my-2 text-xs bg-slate-950 p-2.5 rounded-lg border border-red-900/40">
              <div>
                <span className="text-slate-400">Passenger:</span>
                <div className="font-bold text-white flex items-center gap-1">
                  <User className="w-3 h-3 text-blue-400" />
                  <span>{alert.passengerName}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400">Bus Unit:</span>
                <div className="font-bold text-blue-300 font-mono">{alert.busId}</div>
              </div>
            </div>

            {alert.message && (
              <p className="text-xs text-rose-200 mb-3 bg-red-950/60 p-2 rounded border border-red-900/40">
                &ldquo;{alert.message}&rdquo;
              </p>
            )}

            {/* Actions */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {onFocusAlertOnMap && (
                <button
                  onClick={() => onFocusAlertOnMap(alert.location)}
                  className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 border border-slate-700"
                >
                  <MapPin className="w-3 h-3 text-blue-400" />
                  <span>Map Pin</span>
                </button>
              )}

              <button
                onClick={() => onAcknowledge(alert.id)}
                className="py-1.5 px-2 rounded-lg bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 text-xs font-bold flex items-center justify-center gap-1 transition"
              >
                <Clock className="w-3 h-3" />
                <span>Acknowledge</span>
              </button>

              <button
                onClick={() => onResolve(alert.id)}
                className="py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1 transition"
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
            className="rounded-xl p-3.5 bg-slate-950 border border-amber-800 shadow"
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                ACKNOWLEDGED (IN DISPATCH)
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="text-xs text-slate-300">
              <b>{alert.passengerName}</b> on <b>{alert.busId}</b>
            </div>

            <div className="flex items-center justify-end gap-2 mt-2">
              {onFocusAlertOnMap && (
                <button
                  onClick={() => onFocusAlertOnMap(alert.location)}
                  className="py-1 px-2.5 rounded-lg bg-slate-900 text-slate-300 text-xs font-medium border border-slate-800 flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3 text-blue-400" />
                  <span>View</span>
                </button>
              )}
              <button
                onClick={() => onResolve(alert.id)}
                className="py-1 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1"
              >
                <CheckCircle className="w-3 h-3" />
                <span>Mark Resolved</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
