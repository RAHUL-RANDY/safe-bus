"use client";

import React, { useState, useEffect } from "react";
import { TripVideoRecording } from "@/types";
import { getVideoRetentionEngine } from "@/lib/video-retention";
import {
  ShieldCheck,
  Trash2,
  Clock,
  Lock,
  Play,
  Sparkles,
  AlertCircle,
  Video,
  X,
  FastForward,
  CheckCircle2,
} from "lucide-react";

interface VideoRetentionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId?: string;
}

export default function VideoRetentionModal({
  isOpen,
  onClose,
  tripId,
}: VideoRetentionModalProps) {
  const [recordings, setRecordings] = useState<TripVideoRecording[]>([]);
  const [now, setNow] = useState<number>(Date.now());
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const engine = getVideoRetentionEngine();
    const unsub = engine.subscribe((recs) => {
      setRecordings(recs);
    });

    const clockTimer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      unsub();
      clearInterval(clockTimer);
    };
  }, [isOpen]);

  const formatRemainingTime = (expiresAt: number) => {
    const diff = expiresAt - now;
    if (diff <= 0) return "Expired (Purged)";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
  };

  const handleSimulateFastForward = () => {
    const engine = getVideoRetentionEngine();
    engine.simulateFastForward24Hours();
    setNotification("⏩ Fast-forwarded 24 hours: Expired footage was automatically purged!");
    setTimeout(() => setNotification(null), 4000);
  };

  const handlePreserveIncident = (id: string) => {
    const engine = getVideoRetentionEngine();
    engine.preserveIncidentVideo(id);
    setNotification("🛡️ Evidence Preserved: Flagged for legal dispute review.");
    setTimeout(() => setNotification(null), 4000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900/95 border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.25)] flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  24-Hour Ephemeral Video Vault
                </h3>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/30 font-bold">
                  PRIVACY PROTOCOL
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Automated 24-hour permanent deletion policy post ride completion
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

        {/* Notice Banner */}
        <div className="p-4 bg-blue-950/40 border-b border-cyan-500/20 flex items-start gap-3 text-xs">
          <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-slate-300">
            <strong className="text-cyan-300 font-semibold">Zero-Knowledge Passenger Privacy:</strong> All on-board CCTV and passenger camera video clips are encrypted with <code className="text-cyan-200">AES-256-GCM</code> and automatically destroyed <strong className="text-white">exactly 24 hours</strong> after your ride ends.
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Content List */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
          {recordings.length === 0 ? (
            <div className="text-center py-10">
              <Trash2 className="w-10 h-10 text-slate-500 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-300">Vault Empty (All Expired Videos Purged)</div>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No active recordings found. Any previous footage was permanently deleted upon reaching the 24-hour retention window.
              </p>
            </div>
          ) : (
            recordings.map((rec) => {
              const isExpired = rec.expiresAt <= now;
              return (
                <div
                  key={rec.id}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 hover:border-cyan-500/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 border border-cyan-500/30">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{rec.recordedBy}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {rec.busId} • {rec.durationSeconds}s
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-cyan-400" />
                        <span>Hash: {rec.encryptionHash}</span>
                      </div>

                      {/* Expiration Timer Countdown */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[11px] font-mono font-bold text-amber-300">
                          {rec.isIncidentPreserved ? (
                            <span className="text-rose-400">🛡️ PRESERVED FOR SOS EVIDENCE</span>
                          ) : (
                            `Deletes in: ${formatRemainingTime(rec.expiresAt)}`
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {!rec.isIncidentPreserved && (
                      <button
                        onClick={() => handlePreserveIncident(rec.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-white/10 transition"
                        title="Preserve for emergency investigation"
                      >
                        Keep as Evidence
                      </button>
                    )}

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                        rec.isIncidentPreserved
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      }`}
                    >
                      {rec.isIncidentPreserved ? "PRESERVED" : "24H PURGE ARMED"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Fast-Forward Simulation Tool */}
        <div className="p-4 bg-slate-950/90 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400">
            Automated cron worker runs every <strong className="text-white">15 seconds</strong>.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateFastForward}
              className="px-3 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-400/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Simulate 24h Expiration</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
