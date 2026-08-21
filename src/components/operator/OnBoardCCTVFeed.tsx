"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Video,
  Radio,
  Eye,
  ShieldAlert,
  Activity,
  AlertTriangle,
  Settings,
  Globe,
  Lock,
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
  const [drowsinessScore, setDrowsinessScore] = useState<number>(98);
  const [isSimDistracted, setIsSimDistracted] = useState<boolean>(false);
  const [isVaultOpen, setIsVaultOpen] = useState<boolean>(false);
  const [clientTime, setClientTime] = useState<string>("");

  useEffect(() => {
    const cfg = getBusCameraConfig(bus?.id || "BUS-42A");
    setCctvConfig(cfg);
    setFeedMode(cfg.preferredMode || "ip_stream");
  }, [bus?.id]);

  useEffect(() => {
    setClientTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => {
      setClientTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
      setWebcamError("Webcam permission denied. Showing telemetry simulation.");
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
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>On-Board Bus CCTV Surveillance</span>
              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 text-xs font-mono border border-blue-800">
                {bus?.id || "BUS-42A"}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              4-Channel Live Video • Driver DMS & Cabin Monitoring
            </p>
          </div>
        </div>

        {/* Source Mode Selector & Settings */}
        <div className="flex items-center gap-2">
          {/* Mode switch */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setFeedMode("ip_stream")}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 text-xs ${
                feedMode === "ip_stream"
                  ? "bg-blue-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>IP Stream</span>
            </button>
            <button
              onClick={() => setFeedMode("webcam")}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 text-xs ${
                feedMode === "webcam"
                  ? "bg-blue-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Camera className="w-3 h-3" />
              <span>Webcam</span>
            </button>
            <button
              onClick={() => setFeedMode("simulation")}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 text-xs ${
                feedMode === "simulation"
                  ? "bg-blue-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>AI HUD</span>
            </button>
          </div>

          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-blue-400 border border-slate-800 text-xs font-bold transition flex items-center gap-1.5"
            title="Configure Real CCTV IP / RTSP Stream URLs"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">CCTV Setup</span>
          </button>
        </div>
      </div>

      {/* Main CCTV Screen */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 shadow-inner flex items-center justify-center">
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
          <div className="w-full h-full relative flex items-center justify-center bg-slate-950 text-center p-4">
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-950 text-blue-400 border border-blue-800 mb-2">
                <Video className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                CHANNEL 0{selectedChannel === "driver" ? "1 • DRIVER DMS" : selectedChannel === "road" ? "02 • WINDSHIELD ROAD" : selectedChannel === "cabin" ? "03 • PASSENGER CABIN" : "04 • REAR DOOR"}
              </h4>
              <p className="text-xs text-blue-400 font-mono mt-0.5">
                {bus?.plateNumber || "KA 01 F 8821"} • 1080p 30FPS LIVE
              </p>
              {feedMode === "ip_stream" && !activeStreamUrl && (
                <div className="mt-2 text-xs text-slate-400">
                  <span>No custom stream URL set. </span>
                  <button
                    onClick={() => setIsConfigModalOpen(true)}
                    className="text-blue-400 underline font-bold"
                  >
                    Click to add IP stream URL
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Overlays */}
        <div className="absolute inset-0 pointer-events-none p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-1.5 bg-black/80 px-2.5 py-1 rounded border border-slate-800 text-blue-300">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              REC • {clientTime || "--:--:--"} • CH-0{selectedChannel === "driver" ? "1" : selectedChannel === "road" ? "2" : selectedChannel === "cabin" ? "3" : "4"}
            </span>

            <div className="flex items-center gap-2">
              <span className="bg-black/80 px-2.5 py-1 rounded border border-slate-800 text-emerald-400 font-bold">
                SPEED: {bus?.speed || 42} KM/H
              </span>
            </div>
          </div>

          {selectedChannel === "driver" && (
            <div
              className={`self-center p-3 rounded-xl border transition flex flex-col items-center gap-1 ${
                isSimDistracted
                  ? "border-red-600 bg-red-950/80 text-red-300"
                  : "border-blue-500/40 bg-black/75 text-blue-300"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold">
                {isSimDistracted ? (
                  <>
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span>⚠️ DROWSINESS DETECTED</span>
                  </>
                ) : (
                  <span>AI DRIVER DMS: OPTIMAL</span>
                )}
              </div>
              <span className="text-[10px] font-mono">
                Driver: {bus?.driverName || "Driver"} • Alertness: {drowsinessScore}%
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 bg-black/80 px-3 py-1.5 rounded border border-slate-800">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-blue-400" />
              TELEMETRY: STABLE • SEATBELT: FASTENED
            </span>
            <span className="text-blue-300">
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
              ? "bg-blue-600 text-white border-blue-500"
              : "bg-slate-950 border-slate-800 text-slate-300 hover:text-white"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Driver DMS</span>
        </button>

        <button
          onClick={() => setSelectedChannel("road")}
          className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
            selectedChannel === "road"
              ? "bg-blue-600 text-white border-blue-500"
              : "bg-slate-950 border-slate-800 text-slate-300 hover:text-white"
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Road View</span>
        </button>

        <button
          onClick={() => setSelectedChannel("cabin")}
          className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
            selectedChannel === "cabin"
              ? "bg-blue-600 text-white border-blue-500"
              : "bg-slate-950 border-slate-800 text-slate-300 hover:text-white"
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Cabin Aisle</span>
        </button>

        <button
          onClick={() => setSelectedChannel("door")}
          className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
            selectedChannel === "door"
              ? "bg-blue-600 text-white border-blue-500"
              : "bg-slate-950 border-slate-800 text-slate-300 hover:text-white"
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Rear Gate</span>
        </button>
      </div>

      {/* 24h Purge Status Strip */}
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-300 font-medium">Encrypted 24-Hour Purge Active</span>
          <button
            onClick={() => setIsVaultOpen(true)}
            className="text-blue-400 hover:text-blue-300 font-bold underline text-xs ml-1"
          >
            Video Retention Vault
          </button>
        </div>

        <button
          onClick={toggleSimulatedDistraction}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            isSimDistracted
              ? "bg-red-600 hover:bg-red-500 text-white"
              : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{isSimDistracted ? "Clear Fatigue Warning" : "Simulate Driver Fatigue"}</span>
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
