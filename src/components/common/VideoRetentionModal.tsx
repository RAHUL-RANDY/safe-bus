"use client";

import React, { useState, useEffect } from "react";
import { TripVideoRecording } from "@/types";
import { getVideoRetentionEngine } from "@/lib/video-retention";
import { getSoundEngine } from "@/lib/audio-effects";
import {
  ShieldCheck,
  Trash2,
  Clock,
  Lock,
  Play,
  Pause,
  Sparkles,
  AlertCircle,
  Video,
  X,
  FastForward,
  CheckCircle2,
  Download,
  Camera,
  Maximize2,
  Volume2,
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
  const [activePlayingRecording, setActivePlayingRecording] = useState<TripVideoRecording | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) return;

    const engine = getVideoRetentionEngine();
    const unsub = engine.subscribe((recs) => {
      setRecordings(recs);
      if (recs.length > 0 && !activePlayingRecording) {
        setActivePlayingRecording(recs[0]);
      }
    });

    const clockTimer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      unsub();
      clearInterval(clockTimer);
    };
  }, [isOpen]);

  // Video progress animation when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activePlayingRecording && isPlaying) {
      interval = setInterval(() => {
        setPlaybackProgress((prev) => (prev >= 100 ? 0 : prev + 2.5));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [activePlayingRecording, isPlaying]);

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
    getSoundEngine().playClick();
    setTimeout(() => setNotification(null), 4000);
  };

  const handlePreserveIncident = (id: string) => {
    const engine = getVideoRetentionEngine();
    engine.preserveIncidentVideo(id);
    setNotification("🛡️ Evidence Preserved: Flagged for legal & driver safety dispute review.");
    getSoundEngine().playSuccess();
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSelectRecording = (rec: TripVideoRecording) => {
    setActivePlayingRecording(rec);
    setIsPlaying(true);
    setPlaybackProgress(0);
    getSoundEngine().playClick();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Driver & Fleet Saved Video Archive (DVR Vault)
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800 font-bold">
                  24H VAULT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Encrypted on-board CCTV recordings, DMS dashcam clips & passenger safety incident footage
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Banner */}
        <div className="p-3.5 bg-blue-950/40 border-b border-slate-800 flex items-start gap-2.5 text-xs text-slate-300">
          <Lock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-blue-300 font-semibold">Zero-Knowledge Encrypted Footage:</strong> All vehicle CCTV & dashcam clips are encrypted with <code className="text-blue-200">AES-256-GCM</code> and auto-purged after 24 hours unless preserved for safety audit.
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Main Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {/* Active Video Player Screen */}
          {activePlayingRecording && (
            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl relative">
              {/* Simulated Video Canvas Frame */}
              <div className="relative aspect-video max-h-[320px] w-full bg-slate-950 flex flex-col justify-between p-4 overflow-hidden">
                {/* Simulated Road / Cabin Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-950 to-slate-900/90" />

                {/* Animated Scanline Grid */}
                <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] opacity-15" />

                {/* Top HUD Overlay */}
                <div className="relative z-10 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-white font-bold">DVR PLAYBACK: {activePlayingRecording.busId}</span>
                    <span className="text-slate-400">• {activePlayingRecording.recordedBy}</span>
                  </div>

                  <span className="bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800 text-blue-300">
                    ENCRYPTION: AES-256
                  </span>
                </div>

                {/* Center Big Play Status */}
                <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-500/50 text-blue-300 flex items-center justify-center mb-2 shadow-lg">
                    {isPlaying ? <Play className="w-7 h-7 fill-current" /> : <Pause className="w-7 h-7" />}
                  </div>
                  <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                    {activePlayingRecording.recordedBy} Footage ({activePlayingRecording.durationSeconds}s)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Hash: {activePlayingRecording.encryptionHash}
                  </span>
                </div>

                {/* Bottom Scrubber & Controls */}
                <div className="relative z-10 space-y-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  {/* Timeline Progress Bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${playbackProgress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition font-bold"
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      </button>
                      <span className="text-slate-300 text-[11px] font-mono">
                        {Math.floor((playbackProgress / 100) * activePlayingRecording.durationSeconds)}s /{" "}
                        {activePlayingRecording.durationSeconds}s
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePreserveIncident(activePlayingRecording.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 transition"
                      >
                        🛡️ Preserve as Evidence
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recordings Feed */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
              <span>Saved Video Clips ({recordings.length})</span>
              <span className="text-[10px] text-slate-500 font-mono">Click any clip to play</span>
            </div>

            {recordings.length === 0 ? (
              <div className="text-center py-10 rounded-2xl bg-slate-950 border border-slate-800">
                <Trash2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <div className="text-sm font-bold text-slate-300">DVR Vault Empty</div>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  No active recordings found. Any previous footage was permanently deleted upon reaching the 24-hour retention window.
                </p>
              </div>
            ) : (
              recordings.map((rec) => {
                const isSelected = activePlayingRecording?.id === rec.id;

                return (
                  <div
                    key={rec.id}
                    onClick={() => handleSelectRecording(rec)}
                    className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-blue-950/40 border-blue-500 shadow-md shadow-blue-950/30"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-400"
                            : "bg-slate-800 text-slate-300 border-slate-700"
                        }`}
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{rec.recordedBy}</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {rec.busId} • {rec.durationSeconds}s
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                          <Lock className="w-3 h-3 text-blue-400" />
                          <span>Hash: {rec.encryptionHash}</span>
                        </div>

                        {/* Expiration Timer Countdown */}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span className="text-[10px] font-mono font-bold text-amber-300">
                            {rec.isIncidentPreserved ? (
                              <span className="text-red-400">🛡️ PRESERVED FOR EVIDENCE</span>
                            ) : (
                              `Auto-purges in: ${formatRemainingTime(rec.expiresAt)}`
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                          rec.isIncidentPreserved
                            ? "bg-red-950 text-red-400 border border-red-800"
                            : "bg-blue-950 text-blue-400 border border-blue-800"
                        }`}
                      >
                        {rec.isIncidentPreserved ? "PRESERVED" : "24H ARMED"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer with Fast-Forward Simulation Tool */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400">
            Encrypted with <strong className="text-white">AES-256</strong> • Automatically purged after 24 hours.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateFastForward}
              className="px-3 py-1.5 rounded-xl bg-blue-950 hover:bg-blue-900 border border-blue-800 text-blue-300 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Simulate 24h Purge</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
