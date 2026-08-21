"use client";

import React, { useState } from "react";
import { Bus, Trip } from "@/types";
import { getVoiceGuardian } from "@/lib/voice-guardian";
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  CloudSun,
  Activity,
  Share2,
  Radio,
  Sparkles,
  MapPin,
  Clock,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";

interface RouteRiskRadarProps {
  bus?: Bus;
  trip?: Trip;
  onTriggerSOS?: (reason: string) => void;
}

export default function RouteRiskRadar({
  bus,
  trip,
  onTriggerSOS,
}: RouteRiskRadarProps) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const startVoiceListener = () => {
    setIsListening(true);
    setVoiceNotice("🎙️ Listening for distress keywords: 'Emergency', 'SOS', 'Help me'...");
    getVoiceGuardian().startEmergencyVoiceListener((reason) => {
      if (onTriggerSOS) onTriggerSOS(reason);
      setVoiceNotice(`🚨 Emergency triggered by voice command: "${reason}"`);
      setTimeout(() => setVoiceNotice(null), 5000);
      setIsListening(false);
    });
  };

  const handleShareWhatsApp = () => {
    const busId = bus?.id || "BUS-42A";
    const stop = bus?.nextStop || "Silk Board";
    const eta = bus?.etaMinutes || 5;
    const url = typeof window !== "undefined" ? `${window.location.origin}/ticket?id=${trip?.tripId || "demo"}` : "";

    const text = encodeURIComponent(
      `🚨 *SafeBus Nexus Live Trip Tracking*\nPassenger: ${trip?.passengerName || "Rahul Sharma"}\nBus: ${busId} (${bus?.plateNumber || "KA 01 F 8821"})\nNext Stop: ${stop} (ETA: ${eta} mins)\nLive Ticket & Camera Verification Link: ${url}`
    );

    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="w-full glass-panel p-5 rounded-3xl border border-cyan-500/30 shadow-2xl bg-slate-900/80 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-cyan-500/30">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">AI Corridor Risk Radar & Sentinel</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                98.4% SAFETY INDEX
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Predictive hazard detection • Hands-free Voice Trigger • 1-Tap WhatsApp Emergency Share
            </p>
          </div>
        </div>
      </div>

      {/* Voice Notification Banner */}
      {voiceNotice && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-red-600/30 to-amber-600/30 border border-red-500/40 text-xs text-white flex items-center gap-2 animate-fade-in font-medium">
          <Radio className="w-4 h-4 text-red-400 animate-pulse shrink-0" />
          <span>{voiceNotice}</span>
        </div>
      )}

      {/* 3 Realtime Risk Factors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Road & Blackspot Sentinel */}
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/10">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span>ROAD HAZARD INDEX</span>
            <span className="text-emerald-400 font-bold font-mono">LOW RISK</span>
          </div>
          <div className="font-bold text-white text-xs">Clear Corridor</div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            No blackspot congestion reported on Route 42A.
          </p>
        </div>

        {/* Weather & Friction Sensor */}
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/10">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span>SURFACE WEATHER</span>
            <span className="text-cyan-400 font-bold font-mono">OPTIMAL</span>
          </div>
          <div className="font-bold text-white text-xs">Dry Asphalt (27°C)</div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Friction Coefficient 0.88 • Safe braking distance.
          </p>
        </div>

        {/* Patrol Squad Range */}
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/10">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span>PATROL PROXIMITY</span>
            <span className="text-emerald-400 font-bold font-mono">1.1 KM</span>
          </div>
          <div className="font-bold text-white text-xs">Patrol Squad Alpha-4</div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Rapid dispatch response ETA under ~2 minutes.
          </p>
        </div>
      </div>

      {/* Modern Interactive Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Hands-Free Voice Listener Button */}
        <button
          onClick={startVoiceListener}
          disabled={isListening}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            isListening
              ? "bg-red-600 text-white animate-pulse"
              : "bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30"
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>{isListening ? "Listening Active..." : "🎙️ Hands-Free SOS Voice Guard"}</span>
        </button>

        {/* WhatsApp Share Button */}
        <button
          onClick={handleShareWhatsApp}
          className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share Live GPS on WhatsApp</span>
        </button>
      </div>
    </div>
  );
}
