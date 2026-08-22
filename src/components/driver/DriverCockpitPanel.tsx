"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bus, Alert, RouteStop } from "@/types";
import { ROUTE_STOPS } from "@/lib/route-data";
import { getSyncEngine } from "@/lib/sync-engine";
import CameraModal from "@/components/common/CameraModal";
import CCTVConfigModal from "@/components/common/CCTVConfigModal";
import PassengerManifestModal from "@/components/common/PassengerManifestModal";
import VideoRetentionModal from "@/components/common/VideoRetentionModal";
import {
  getBusCameraConfig,
  BusCameraConfig,
  CCTVFeedMode,
} from "@/lib/cctv-stream-config";
import {
  Gauge,
  Navigation,
  MapPin,
  Users,
  ShieldAlert,
  AlertTriangle,
  Radio,
  Lock,
  Unlock,
  CheckCircle2,
  Camera,
  Activity,
  Clock,
  Maximize2,
  Moon,
  Sun,
  Settings,
  Eye,
  RotateCw,
  Film,
  Video,
} from "lucide-react";

import { getSoundEngine } from "@/lib/audio-effects";
import { useToast } from "@/lib/toast-context";

interface DriverCockpitPanelProps {
  bus: Bus;
  onUpdateBus?: (updated: Bus) => void;
}

type CockpitCamChannel = "driver" | "road" | "cabin" | "door";

export default function DriverCockpitPanel({
  bus,
  onUpdateBus,
}: DriverCockpitPanelProps) {
  const { toast } = useToast();
  const [speed, setSpeed] = useState<number>(bus.speed || 45);
  const [doorsLocked, setDoorsLocked] = useState<boolean>(true);
  const [occupancy, setOccupancy] = useState<number>(bus.occupancy || 28);
  const [dmsScore, setDmsScore] = useState<number>(96);
  const [isDmsCameraOpen, setIsDmsCameraOpen] = useState<boolean>(false);
  const [isManifestOpen, setIsManifestOpen] = useState<boolean>(false);
  const [isVideoRetentionOpen, setIsVideoRetentionOpen] = useState<boolean>(false);
  const [announcementMsg, setAnnouncementMsg] = useState<string | null>(null);
  const [isSosActive, setIsSosActive] = useState<boolean>(bus.status === "emergency");
  const [shiftSeconds, setShiftSeconds] = useState<number>(11700);

  // Bus Camera Integration States
  const [camChannel, setCamChannel] = useState<CockpitCamChannel>("driver");
  const [cctvConfig, setCctvConfig] = useState<BusCameraConfig>(() =>
    getBusCameraConfig(bus?.id || "BUS-42A")
  );
  const [feedMode, setFeedMode] = useState<CCTVFeedMode>("ip_stream");
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [webcamError, setWebcamError] = useState<string>("");
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [isWebcamStreaming, setIsWebcamStreaming] = useState<boolean>(false);
  const [capturedSnap, setCapturedSnap] = useState<string | null>(null);
  const [clientTimestamp, setClientTimestamp] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Sync state when bus prop changes
  useEffect(() => {
    setSpeed(bus.speed);
    setIsSosActive(bus.status === "emergency");
    const cfg = getBusCameraConfig(bus.id);
    setCctvConfig(cfg);
    setFeedMode(cfg.preferredMode || "ip_stream");
  }, [bus]);

  // Client time & shift timer tick
  useEffect(() => {
    setClientTimestamp(new Date().toLocaleTimeString());
    const timer = setInterval(() => {
      setShiftSeconds((prev) => prev + 1);
      setClientTimestamp(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Manage cockpit webcam stream
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
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 360 } },
        audio: false,
      });
      streamRef.current = mediaStream;
      setIsWebcamStreaming(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn("Webcam access error:", err);
      setWebcamError("Camera access denied or device unavailable. Showing high-fidelity telemetry simulation.");
      setFeedMode("simulation");
      setIsWebcamStreaming(false);
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
    setIsWebcamStreaming(false);
  };

  const formatShiftTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSpeedChange = (delta: number) => {
    const newSpeed = Math.max(0, Math.min(100, speed + delta));
    setSpeed(newSpeed);
    getSoundEngine().playClick();
    const updated = { ...bus, speed: newSpeed };
    if (onUpdateBus) onUpdateBus(updated);
    getSyncEngine().updateBusTelemetry(bus.id, { speed: newSpeed });
    if (newSpeed >= 75) {
      toast({
        title: "Speed Anomaly Warning",
        description: `Vehicle speed at ${newSpeed} km/h is approaching safe city limit.`,
        type: "warning",
      });
    }
  };

  const handleToggleDoors = () => {
    const nextLocked = !doorsLocked;
    setDoorsLocked(nextLocked);
    getSoundEngine().playPneumaticDoor();
    toast({
      title: nextLocked ? "Pneumatic Doors Secured" : "Pneumatic Doors Released",
      description: nextLocked ? "All entry & exit doors locked for high-speed transit." : "Passenger entry & exit enabled at corridor platform.",
      type: nextLocked ? "info" : "warning",
    });
  };

  const handlePassengerCountChange = (delta: number) => {
    const newCount = Math.max(0, Math.min(bus.capacity, occupancy + delta));
    setOccupancy(newCount);
    getSoundEngine().playClick();
    const updated = { ...bus, occupancy: newCount };
    if (onUpdateBus) onUpdateBus(updated);
    getSyncEngine().updateBusTelemetry(bus.id, { occupancy: newCount });
  };

  const handleCaptureSnapshot = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (feedMode === "webcam" && videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, 640, 360);
    } else {
      ctx.fillStyle = isNightMode ? "#061a14" : "#0f172a";
      ctx.fillRect(0, 0, 640, 360);
      ctx.fillStyle = isNightMode ? "#10b981" : "#38bdf8";
      ctx.font = "bold 20px monospace";
      ctx.fillText(`SAFEBUS • ${bus.id} [${camChannel.toUpperCase()} CAM]`, 30, 50);
      ctx.font = "14px monospace";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`SPEED: ${speed} KM/H • OCCUPANCY: ${occupancy}/${bus.capacity}`, 30, 90);
      ctx.fillText(`NEXT HUB: ${bus.nextStop}`, 30, 120);
    }

    const dataUrl = canvas.toDataURL("image/png");
    setCapturedSnap(dataUrl);
    setTimeout(() => setCapturedSnap(null), 3000);
  };

  const handleDriverSOS = async (reason: string) => {
    setIsSosActive(true);
    const engine = getSyncEngine();
    const alertId = `alert-${Date.now()}`;
    const newAlert: Alert = {
      id: alertId,
      tripId: `pilot-dispatch-${Date.now()}`,
      busId: bus.id,
      passengerName: `Pilot ${bus.driverName}`,
      type: "sos",
      location: bus.currentLocation,
      timestamp: Date.now(),
      status: "open",
      message: `PILOT SOS [${bus.id}]: ${reason}`,
    };
    await engine.triggerSOS(newAlert);
  };

  const playAnnouncement = (text: string) => {
    setAnnouncementMsg(text);
    setTimeout(() => setAnnouncementMsg(null), 5000);
  };

  const handleAdvanceNextStop = () => {
    const nextIdx = (bus.nextStopIndex + 1) % ROUTE_STOPS.length;
    const nextStop = ROUTE_STOPS[nextIdx];
    playAnnouncement(`Now arriving at: ${nextStop.name}. Please prepare for alighting.`);
  };

  const isOverspeed = speed > 60;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Banner: Shift & Vehicle Identity */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Driver Cockpit: {bus.id}
              </h2>
              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono text-xs font-bold border border-blue-800">
                {bus.plateNumber}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Assigned Driver: <strong className="text-white">{bus.driverName}</strong> • {bus.routeName}
            </p>
          </div>
        </div>

        {/* Live Shift & Door Status */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsManifestOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition"
            title="View full on-board passenger manifest and emergency contacts"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Passenger Manifest ({occupancy})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsVideoRetentionOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition"
            title="View saved on-board CCTV and Dashcam video recordings"
          >
            <Film className="w-3.5 h-3.5" />
            <span>Saved Videos (DVR)</span>
          </button>

          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <div>
              <div className="text-[9px] uppercase font-bold text-slate-400">Shift Elapsed</div>
              <div className="text-xs font-mono font-bold text-white">{formatShiftTime(shiftSeconds)}</div>
            </div>
          </div>

          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
              doorsLocked
                ? "bg-emerald-950/60 border-emerald-800 text-emerald-400"
                : "bg-amber-950/60 border-amber-800 text-amber-300"
            }`}
          >
            {doorsLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            <div>
              <div className="text-[9px] uppercase font-bold">Door Interlock</div>
              <div className="text-xs font-bold font-mono">{doorsLocked ? "LOCKED (SAFE)" : "DOORS OPEN"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* PA Announcement Notification */}
      {announcementMsg && (
        <div className="p-3.5 rounded-xl bg-blue-600 text-white flex items-center justify-between gap-3 shadow">
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">📢 PA Notice: {announcementMsg}</span>
          </div>
          <span className="text-[10px] bg-blue-900/80 px-2 py-0.5 rounded font-mono">Broadcasting</span>
        </div>
      )}

      {/* Main Cockpit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Telemetry Gauges & Speed Controls (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Speedometer Card */}
          <div
            className={`p-6 rounded-2xl border shadow-md transition ${
              isOverspeed ? "border-red-600 bg-red-950/20" : "border-slate-800 bg-slate-900"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Digital Speedometer HUD
              </span>
              <span
                className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  isOverspeed
                    ? "bg-red-600/20 text-red-300 border-red-500"
                    : "bg-emerald-600/20 text-emerald-300 border-emerald-500/40"
                }`}
              >
                {isOverspeed ? "⚠️ OVERSPEED WARNING" : "SPEED REGULATED"}
              </span>
            </div>

            {/* Speed Display */}
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span
                    className={`text-6xl sm:text-7xl font-black font-mono tracking-tight ${
                      isOverspeed ? "text-red-400" : "text-blue-400"
                    }`}
                  >
                    {speed}
                  </span>
                  <span className="text-base font-bold text-slate-400">KM/H</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">Regulatory Limit: 60 KM/H</div>
              </div>

              {/* Quick Speed Controls */}
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <div className="text-xs font-bold text-slate-400 text-center sm:text-left">
                  Throttle Controls
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSpeedChange(10)}
                    className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition"
                  >
                    +10 km/h
                  </button>
                  <button
                    onClick={() => handleSpeedChange(5)}
                    className="px-3 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs transition"
                  >
                    +5 km/h
                  </button>
                  <button
                    onClick={() => handleSpeedChange(-5)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
                  >
                    -5 km/h
                  </button>
                  <button
                    onClick={() => setSpeed(0)}
                    className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition"
                  >
                    🛑 Stop
                  </button>
                </div>
              </div>
            </div>

            {/* Slider */}
            <div className="mt-4">
              <input
                type="range"
                min="0"
                max="90"
                value={speed}
                onChange={(e) => handleSpeedChange(parseInt(e.target.value) - speed)}
                className="w-full accent-blue-500 h-2 bg-slate-950 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Route Navigation & Next Stop Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Current Route Stop
                </h3>
              </div>
              <button
                onClick={handleAdvanceNextStop}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 transition flex items-center gap-1"
              >
                <span>Arrive at Next Stop</span>
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase font-bold text-blue-400">Next Destination Hub</div>
                <div className="text-base sm:text-lg font-bold text-white">{bus.nextStop}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Estimated Arrival: <strong className="text-blue-300">~{bus.etaMinutes} minutes</strong>
                </div>
              </div>

              <button
                onClick={() => playAnnouncement(`Next stop is ${bus.nextStop}. Passengers, please prepare for alighting.`)}
                className="px-3.5 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 border border-blue-800 text-blue-200 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Broadcast Stop Notice</span>
              </button>
            </div>
          </div>

          {/* Door Interlock & Passenger Management */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Door Control */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow flex flex-col justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-200">Pneumatic Door System</div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Interlocked with speed sensor.
                </p>
              </div>

              <button
                onClick={handleToggleDoors}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                  doorsLocked
                    ? "bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow"
                }`}
              >
                {doorsLocked ? (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Open Doors (Boarding Mode)</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Lock & Secure Doors</span>
                  </>
                )}
              </button>
            </div>

            {/* Occupancy Counter */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">Cabin Occupancy</div>
                  <div className="text-lg font-black text-white font-mono">
                    {occupancy} / {bus.capacity} Seats
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsManifestOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-800 text-xs font-bold flex items-center gap-1.5 transition"
                  title="View full on-board passenger manifest"
                >
                  <Users className="w-4 h-4" />
                  <span>Roster Details →</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handlePassengerCountChange(1)}
                  className="py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 text-xs font-bold transition"
                >
                  + Boarding (1)
                </button>
                <button
                  onClick={() => handlePassengerCountChange(-1)}
                  className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition"
                >
                  - Alighting (1)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Driver DMS Camera & Emergency Dispatch (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* On-Board Live Multi-Channel Bus Camera Suite */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col gap-3.5">
            {/* Camera Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-800">
                  <Camera className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  Bus CCTV Camera Feed
                  <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-red-950 text-red-400 font-mono border border-red-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                    REC
                  </span>
                </h3>
              </div>

              {/* Source Controls */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-bold">
                  <button
                    onClick={() => setFeedMode("ip_stream")}
                    className={`px-2 py-0.5 rounded transition ${
                      feedMode === "ip_stream"
                        ? "bg-blue-600 text-white font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    IP Stream
                  </button>
                  <button
                    onClick={() => setFeedMode("webcam")}
                    className={`px-2 py-0.5 rounded transition ${
                      feedMode === "webcam"
                        ? "bg-blue-600 text-white font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Webcam
                  </button>
                  <button
                    onClick={() => setFeedMode("simulation")}
                    className={`px-2 py-0.5 rounded transition ${
                      feedMode === "simulation"
                        ? "bg-blue-600 text-white font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    AI HUD
                  </button>
                </div>

                <button
                  onClick={() => setIsConfigModalOpen(true)}
                  className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
                  title="Configure Bus IP Camera URLs"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Channel Tabs */}
            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-bold">
              {(
                [
                  { id: "driver", label: "Pilot DMS" },
                  { id: "road", label: "Road Front" },
                  { id: "cabin", label: "Cabin CCTV" },
                  { id: "door", label: "Door Cam" },
                ] as const
              ).map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setCamChannel(ch.id)}
                  className={`py-1 rounded-lg transition text-center ${
                    camChannel === ch.id
                      ? "bg-blue-600 text-white font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {ch.label}
                </button>
              ))}
            </div>

            {/* Error banner if webcam blocked */}
            {webcamError && (
              <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-800 text-[10px] text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{webcamError}</span>
              </div>
            )}

            {/* Camera Viewfinder Screen */}
            <div
              className={`relative aspect-video rounded-xl overflow-hidden bg-black border shadow-inner flex items-center justify-center ${
                isNightMode ? "border-emerald-500/50" : "border-slate-800"
              }`}
            >
              {/* Real Hardware Webcam Feed */}
              {feedMode === "webcam" && isWebcamStreaming ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${
                    isNightMode
                      ? "brightness-125 contrast-125 hue-rotate-90 filter invert-[0.1]"
                      : ""
                  }`}
                />
              ) : feedMode === "ip_stream" && cctvConfig.channelStreams?.[camChannel] ? (
                /* Real IP Camera Stream */
                cctvConfig.channelStreams[camChannel].includes("/video") ||
                cctvConfig.channelStreams[camChannel].includes(".mjpg") ||
                cctvConfig.channelStreams[camChannel].includes(".mjpeg") ? (
                  <img
                    src={cctvConfig.channelStreams[camChannel]}
                    alt="Real Bus IP CCTV Stream"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={cctvConfig.channelStreams[camChannel]}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                /* Simulation Graphics */
                <div
                  className={`w-full h-full relative flex flex-col items-center justify-center p-4 select-none ${
                    isNightMode
                      ? "bg-slate-950 text-emerald-400"
                      : "bg-slate-950 text-blue-400"
                  }`}
                >
                  {camChannel === "driver" && (
                    <div className="text-center space-y-1">
                      <div className="w-14 h-14 rounded-xl border border-blue-500/40 mx-auto flex items-center justify-center bg-slate-900">
                        <Eye className="w-7 h-7 text-blue-400" />
                      </div>
                      <div className="text-xs font-bold text-white">Driver Fatigue & Gaze Monitor</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Alertness Index: {dmsScore}% • Eyes On Road
                      </div>
                    </div>
                  )}

                  {camChannel === "road" && (
                    <div className="text-center space-y-1">
                      <div className="w-14 h-14 rounded-xl border border-emerald-500/40 mx-auto flex items-center justify-center bg-slate-900">
                        <Navigation className="w-7 h-7 text-emerald-400" />
                      </div>
                      <div className="text-xs font-bold text-white">Road Ahead Camera</div>
                      <div className="text-[10px] text-emerald-400 font-mono">
                        Lane Tracking Active • Radar Clear
                      </div>
                    </div>
                  )}

                  {camChannel === "cabin" && (
                    <div className="text-center space-y-1">
                      <div className="w-14 h-14 rounded-xl border border-slate-700 mx-auto flex items-center justify-center bg-slate-900">
                        <Users className="w-7 h-7 text-blue-300" />
                      </div>
                      <div className="text-xs font-bold text-white">Passenger Cabin CCTV</div>
                      <div className="text-[10px] text-slate-300 font-mono">
                        Occupancy: {occupancy} Passengers
                      </div>
                    </div>
                  )}

                  {camChannel === "door" && (
                    <div className="text-center space-y-1">
                      <div className="w-14 h-14 rounded-xl border border-slate-700 mx-auto flex items-center justify-center bg-slate-900">
                        {doorsLocked ? (
                          <Lock className="w-7 h-7 text-amber-400" />
                        ) : (
                          <Unlock className="w-7 h-7 text-emerald-400" />
                        )}
                      </div>
                      <div className="text-xs font-bold text-white">Door Entry Camera</div>
                      <div className="text-[10px] text-slate-300 font-mono">
                        Status: {doorsLocked ? "LOCKED" : "OPEN"}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Dynamic Camera HUD Overlays */}
              <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="bg-black/80 px-2 py-0.5 rounded text-blue-300 border border-slate-800">
                    CAM: {bus.id} / CH-{camChannel.toUpperCase()}
                  </span>
                  <span className="bg-black/80 px-2 py-0.5 rounded text-white border border-slate-800">
                    {clientTimestamp}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="bg-black/80 px-2 py-0.5 rounded text-emerald-400 border border-slate-800">
                    SPEED: {speed} KM/H
                  </span>
                  <span className="bg-black/80 px-2 py-0.5 rounded text-slate-300 border border-slate-800">
                    🔒 12H RETENTION
                  </span>
                </div>
              </div>

              {/* Snapshot confirmation */}
              {capturedSnap && (
                <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-3 z-20">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-1" />
                  <span className="text-xs font-bold text-white">Snapshot Captured!</span>
                  <span className="text-[10px] text-blue-300 font-mono">Saved to trip log</span>
                </div>
              )}
            </div>

            {/* Quick Action Control Strip */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setIsNightMode(!isNightMode)}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 border ${
                  isNightMode
                    ? "bg-emerald-950 border-emerald-800 text-emerald-300"
                    : "bg-slate-950 border-slate-800 text-slate-300 hover:text-white"
                }`}
              >
                {isNightMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                <span>{isNightMode ? "Night: ON" : "Night Vision"}</span>
              </button>

              <button
                onClick={handleCaptureSnapshot}
                className="py-1.5 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-blue-300 text-xs font-bold transition flex items-center justify-center gap-1"
                title="Capture timestamped snapshot"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Snap Photo</span>
              </button>

              <button
                onClick={() => setIsDmsCameraOpen(true)}
                className="py-1.5 px-2 rounded-lg bg-blue-950 hover:bg-blue-900 border border-blue-800 text-blue-300 text-xs font-bold transition flex items-center justify-center gap-1"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Expand</span>
              </button>
            </div>

            {/* View Saved DVR Videos Trigger */}
            <button
              onClick={() => setIsVideoRetentionOpen(true)}
              className="w-full py-2 px-3 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/80 text-purple-300 hover:text-purple-200 text-xs font-bold transition flex items-center justify-center gap-2 shadow"
            >
              <Film className="w-4 h-4 text-purple-400" />
              <span>View Saved Trip Videos ({bus.id} • 12H Archive) →</span>
            </button>
          </div>

          {/* Driver Emergency SOS & Hazard Broadcast */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-red-900/50 shadow flex flex-col gap-3.5">
            <div className="flex items-center gap-2 text-red-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Pilot Emergency Console
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Instantly broadcast emergency distress signals directly to Fleet Command.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleDriverSOS("Driver Accident / Vehicle Collision")}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow transition flex items-center justify-center gap-2"
              >
                <Radio className="w-4 h-4" />
                <span>🚨 ACCIDENT / CRASH SOS</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDriverSOS("Medical Emergency On Board Bus")}
                  className="py-2 px-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <span>🏥 Medical Aid</span>
                </button>
                <button
                  onClick={() => handleDriverSOS("Mechanical Breakdown / Engine Fault")}
                  className="py-2 px-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <span>⚙️ Breakdown</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Viewfinder Modal for Driver */}
      <CameraModal
        isOpen={isDmsCameraOpen}
        onClose={() => setIsDmsCameraOpen(false)}
        title="Driver DMS Live Safety Camera"
        subtitle={`Live monitoring active for Pilot ${bus.driverName} • ${bus.id}`}
        watermarkText={`DRIVER COCKPIT • ${bus.id} • ${bus.driverName}`}
        busId={bus.id}
      />

      <CCTVConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        busId={bus.id}
        onConfigSaved={(updated) => {
          setCctvConfig(updated);
          setFeedMode(updated.preferredMode);
        }}
      />

      <PassengerManifestModal
        isOpen={isManifestOpen}
        onClose={() => setIsManifestOpen(false)}
        targetBusId={bus.id}
      />

      <VideoRetentionModal
        isOpen={isVideoRetentionOpen}
        onClose={() => setIsVideoRetentionOpen(false)}
        targetBusId={bus.id}
      />
    </div>
  );
}
