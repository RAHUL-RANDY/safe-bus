"use client";

import React, { useState, useRef, useEffect } from "react";

import {
  Camera,
  Video,
  Radio,
  Eye,
  ShieldAlert,
  Zap,
  Activity,
  Maximize2,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Settings,
  Globe,
} from "lucide-react";
import { Bus } from "@/types";
import VideoRetentionModal from "@/components/common/VideoRetentionModal";
import CCTVConfigModal from "@/components/common/CCTVConfigModal";
import {
  getBusCameraConfig,
  BusCameraConfig,
  CCTVFeedMode,
  CCTVChannel,
} from "@/lib/cctv-stream-config";

interface OnBoardCCTVFeedProps {
  bus?: Bus;
  onFlagDriverDistraction?: () => void;
}

export default function OnBoardCCTVFeed({
  bus,
  onFlagDriverDistraction,
}: OnBoardCCTVFeedProps) {
  const [selectedChannel, setSelectedChannel] = useState<CCTVChannel>("driver");
  const [cctvConfig, setCctvConfig] = useState<BusCameraConfig>(() =>
    getBusCameraConfig(bus?.id || "BUS-42A")
  );
  const [feedMode, setFeedMode] = useState<CCTVFeedMode>("ip_stream");
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const [webcamError, setWebcamError] = useState<string>("");
  const [streamLoadError, setStreamLoadError] = useState<string>("");
  const [drowsinessScore, setDrowsinessScore] = useState<number>(98); // 98% alert
  const [isSimDistracted, setIsSimDistracted] = useState<boolean>(false);
  const [isVaultOpen, setIsVaultOpen] = useState<boolean>(false);
  // Client-only clock to avoid SSR hydration mismatch
  const [clientTime, setClientTime] = useState<string>("");

  useEffect(() => {
    // Sync CCTV configuration on bus change or mount
    const cfg = getBusCameraConfig(bus?.id || "BUS-42A");
    setCctvConfig(cfg);
    setFeedMode(cfg.preferredMode || "ip_stream");
  }, [bus?.id]);

  useEffect(() => {
    // Set initial time on mount (client-only)
    setClientTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => {
      setClientTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Manage webcam stream when enabled
  useEffect(() => {
    if (feedMode === "webcam") {
      startWebcam();
    } else {
      stopWebcam();
    }

    return () => {
      stopWebcam();
    };
  }, [feedMode]);

  const startWebcam = async () => {
    setWebcamError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Webcam not supported");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 360 } },
        audio: false,
      });

      streamRef.current = stream;
      setIsWebcamActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn("Webcam access error:", err);
      setWebcamError("Webcam permission denied or camera unavailable. Switched to simulated CCTV.");
      setFeedMode("simulation");
      setIsWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsWebcamActive(false);
  };

  const toggleSimulatedDistraction = () => {
    const next = !isSimDistracted;
    setIsSimDistracted(next);
    setDrowsinessScore(next ? 42 : 98);
    if (next && onFlagDriverDistraction) {
      onFlagDriverDistraction();
    }
  };

  const activeStreamUrl = cctvConfig.channelStreams?.[selectedChannel] || "";
  const isMjpegStream =
    activeStreamUrl.includes("/video") ||
    activeStreamUrl.includes(".mjpg") ||
    activeStreamUrl.includes(".mjpeg");

  return (
    <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-white/10 shadow-2xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>On-Board Real Bus CCTV Surveillance</span>
              <span className="px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-400/30">
                {bus?.id || "BUS-42A"}
              </span>
            </h3>
            <p className="text-[11px] text-slate-300">
              4-Channel Live Camera Feeds • AI Gaze Tracking & Cabin Occupancy
            </p>
          </div>
        </div>

        {/* Source Mode Selector & Settings */}
        <div className="flex items-center gap-2">
          {/* Mode switch */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-bold">
            <button
              onClick={() => setFeedMode("ip_stream")}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 text-[11px] ${
                feedMode === "ip_stream"
                  ? "bg-cyan-500 text-slate-950 font-black shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>Real IP Stream</span>
            </button>
            <button
              onClick={() => setFeedMode("webcam")}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 text-[11px] ${
                feedMode === "webcam"
                  ? "bg-cyan-500 text-slate-950 font-black shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Camera className="w-3 h-3" />
              <span>Webcam</span>
            </button>
            <button
              onClick={() => setFeedMode("simulation")}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 text-[11px] ${
                feedMode === "simulation"
                  ? "bg-cyan-500 text-slate-950 font-black shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>AI HUD</span>
            </button>
          </div>

          {/* CCTV Configuration Modal Trigger */}
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition flex items-center gap-1"
            title="Configure Real CCTV IP / RTSP Stream URLs"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">CCTV Setup</span>
          </button>
        </div>
      </div>

      {/* Main CCTV Screen */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/15 shadow-inner flex items-center justify-center">
        {/* Real Hardware Webcam Feed */}
        {feedMode === "webcam" && isWebcamActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
        ) : feedMode === "ip_stream" && activeStreamUrl ? (
          /* Real IP Camera / Bus NVR Stream */
          isMjpegStream ? (
            <img
              src={activeStreamUrl}
              alt="Real Bus IP CCTV Stream"
              className="w-full h-full object-cover"
              onError={() => {
                setStreamLoadError(`Unable to connect to IP camera at ${activeStreamUrl}. Showing telemetry.`);
              }}
            />
          ) : (
            <video
              src={activeStreamUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              onError={() => {
                setStreamLoadError(`Stream at ${activeStreamUrl} unavailable. Showing telemetry.`);
              }}
            />
          )
        ) : (
          /* High-Tech Edge AI Telemetry Simulation */
          <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Grid Lines */}
            <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />

            {/* Channel Display */}
            <div className="text-center relative z-10 p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-400/30 mb-2">
                <Video className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                CHANNEL 0{selectedChannel === "driver" ? "1 • DRIVER DMS" : selectedChannel === "road" ? "02 • WINDSHIELD ROAD" : selectedChannel === "cabin" ? "03 • PASSENGER CABIN" : "04 • REAR DOOR"}
              </h4>
              <p className="text-xs text-cyan-300 font-mono mt-0.5">
                {bus?.plateNumber || "KA 01 F 8821"} • 1080p 30FPS LIVE
              </p>
              {feedMode === "ip_stream" && !activeStreamUrl && (
                <div className="mt-2 text-[11px] text-slate-400">
                  <span>No custom stream URL entered. </span>
                  <button
                    onClick={() => setIsConfigModalOpen(true)}
                    className="text-cyan-400 underline font-bold"
                  >
                    Click to add IP stream URL
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Computer Vision Overlays */}
        <div className="absolute inset-0 pointer-events-none p-3.5 flex flex-col justify-between">
          {/* Top HUD bar */}
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-white/20 text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              REC • {clientTime || "--:--:-- --"} • CH-0{selectedChannel === "driver" ? "1" : selectedChannel === "road" ? "2" : selectedChannel === "cabin" ? "3" : "4"}
            </span>

            <div className="flex items-center gap-2">
              <span className="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-white/20 text-emerald-400 font-bold">
                SPEED: {bus?.speed || 42} KM/H
              </span>
            </div>
          </div>

          {/* Center AI Target Box (Driver Gaze / Drowsiness) */}
          {selectedChannel === "driver" && (
            <div
              className={`self-center p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                isSimDistracted
                  ? "border-red-500 bg-red-950/40 text-red-300 animate-pulse shadow-[0_0_25px_rgba(239,68,68,0.5)]"
                  : "border-cyan-400 bg-slate-950/60 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-black">
                {isSimDistracted ? (
                  <>
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span>⚠️ DROWSINESS / DISTRACTION DETECTED</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>AI DRIVER DMS: OPTIMAL</span>
                  </>
                )}
              </div>
              <span className="text-[10px] font-mono">
                Driver: {bus?.driverName || "Driver"} • Alertness: {drowsinessScore}%
              </span>
            </div>
          )}

          {/* Bottom Telemetry HUD */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 bg-slate-950/85 px-3 py-1.5 rounded-xl border border-white/10">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" />
              G-FORCE: 0.12g • SEATBELT: FASTENED
            </span>
            <span className="text-cyan-300">
              CABIN OCCUPANCY: {bus?.occupancy || 28}/{bus?.capacity || 45} PASSENGERS
            </span>
          </div>
        </div>
      </div>

      {/* Channel Switcher Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => setSelectedChannel("driver")}
          className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
            selectedChannel === "driver"
              ? "bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/20"
              : "bg-slate-900/60 border-white/10 text-slate-300 hover:text-white"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Driver DMS</span>
        </button>

        <button
          onClick={() => setSelectedChannel("road")}
          className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
            selectedChannel === "road"
              ? "bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/20"
              : "bg-slate-900/60 border-white/10 text-slate-300 hover:text-white"
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Road View</span>
        </button>

        <button
          onClick={() => setSelectedChannel("cabin")}
          className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
            selectedChannel === "cabin"
              ? "bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/20"
              : "bg-slate-900/60 border-white/10 text-slate-300 hover:text-white"
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Cabin Aisle</span>
        </button>

        <button
          onClick={() => setSelectedChannel("door")}
          className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
            selectedChannel === "door"
              ? "bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/20"
              : "bg-slate-900/60 border-white/10 text-slate-300 hover:text-white"
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Rear Gate</span>
        </button>
      </div>

      {/* Driver Behavior Simulator Control & 24h Purge Status */}
      <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/10 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="text-slate-300 font-medium">🔒 24-Hour Purge: CCTV footage deletes 24h post ride</span>
          <button
            onClick={() => setIsVaultOpen(true)}
            className="text-cyan-400 hover:text-cyan-300 font-bold underline text-[11px] ml-1"
          >
            Manage Video Vault
          </button>
        </div>

        <button
          onClick={toggleSimulatedDistraction}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            isSimDistracted
              ? "bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{isSimDistracted ? "Clear Fatigue Warning" : "Trigger Fatigue Anomaly"}</span>
        </button>
      </div>

      <VideoRetentionModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        tripId={bus?.id}
      />

      <CCTVConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        busId={bus?.id || "BUS-42A"}
        onConfigSaved={(updated) => {
          setCctvConfig(updated);
          setFeedMode(updated.preferredMode);
        }}
      />
    </div>
  );
}
