"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bus, Alert, RouteStop } from "@/types";
import { ROUTE_STOPS, ROUTE_COORDINATES } from "@/lib/route-data";
import { getSyncEngine } from "@/lib/sync-engine";
import CameraModal from "@/components/common/CameraModal";
import CCTVConfigModal from "@/components/common/CCTVConfigModal";
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
  Sparkles,
  Camera,
  Activity,
  PhoneCall,
  Clock,
  Zap,
  RotateCw,
  Power,
  Eye,
  Video,
  Maximize2,
  Download,
  Moon,
  Sun,
  RefreshCw,
  Settings,
  Globe,
} from "lucide-react";

interface DriverCockpitPanelProps {
  bus: Bus;
  onUpdateBus?: (updated: Bus) => void;
}

type CockpitCamChannel = "driver" | "road" | "cabin" | "door";

export default function DriverCockpitPanel({
  bus,
  onUpdateBus,
}: DriverCockpitPanelProps) {
  const [speed, setSpeed] = useState<number>(bus.speed || 45);
  const [doorsLocked, setDoorsLocked] = useState<boolean>(true);
  const [occupancy, setOccupancy] = useState<number>(bus.occupancy || 28);
  const [dmsScore, setDmsScore] = useState<number>(96); // Alertness score
  const [isDmsCameraOpen, setIsDmsCameraOpen] = useState<boolean>(false);
  const [announcementMsg, setAnnouncementMsg] = useState<string | null>(null);
  const [isSosActive, setIsSosActive] = useState<boolean>(bus.status === "emergency");
  const [shiftSeconds, setShiftSeconds] = useState<number>(11700); // 3h 15m
  const [hazardNote, setHazardNote] = useState<string>("");

  // Bus Camera Integration States
  const [camChannel, setCamChannel] = useState<CockpitCamChannel>("driver");
  const [cctvConfig, setCctvConfig] = useState<BusCameraConfig>(() =>
    getBusCameraConfig(bus?.id || "BUS-42A")
  );
  const [feedMode, setFeedMode] = useState<CCTVFeedMode>("ip_stream");
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [webcamError, setWebcamError] = useState<string>("");
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
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
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn("Webcam access error:", err);
      setWebcamError("Camera access denied or device unavailable. Showing high-fidelity telemetry simulation.");
      setFeedMode("simulation");
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
      // Draw telemetry visual frame
      ctx.fillStyle = isNightMode ? "#061a14" : "#0f172a";
      ctx.fillRect(0, 0, 640, 360);
      ctx.fillStyle = isNightMode ? "#10b981" : "#38bdf8";
      ctx.font = "bold 20px monospace";
      ctx.fillText(`SAFEBUS NEXUS • ${bus.id} [${camChannel.toUpperCase()} CAM]`, 30, 50);
      ctx.font = "14px monospace";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`SPEED: ${speed} KM/H • OCCUPANCY: ${occupancy}/${bus.capacity}`, 30, 90);
      ctx.fillText(`NEXT HUB: ${bus.nextStop}`, 30, 120);
    }

    // Add HUD Stamp
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    ctx.fillRect(0, 315, 640, 45);
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 11px monospace";
    ctx.fillText(`GPS: ${bus.currentLocation.lat.toFixed(4)}N, ${bus.currentLocation.lng.toFixed(4)}E | ${clientTimestamp}`, 15, 335);
    ctx.fillStyle = "#10b981";
    ctx.fillText("🔒 AES-256 ENCRYPTED • 24H AUTO PURGE ACTIVE", 15, 350);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedSnap(dataUrl);
    setTimeout(() => setCapturedSnap(null), 4000);
  };

  const formatShiftTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSpeedChange = (delta: number) => {
    const newSpeed = Math.max(0, Math.min(95, speed + delta));
    setSpeed(newSpeed);

    // Over-speeding trigger
    if (newSpeed > 75) {
      triggerSpeedWarning(newSpeed);
    }
  };

  const triggerSpeedWarning = (currentSpeed: number) => {
    getSyncEngine().triggerSOS({
      id: `alert-speed-${Date.now()}`,
      tripId: `trip-bus-${bus.id}`,
      busId: bus.id,
      passengerName: "Telematics Automated Speed Alert",
      type: "speed_anomaly",
      location: bus.currentLocation,
      timestamp: Date.now(),
      status: "open",
      message: `Bus ${bus.id} detected overspeeding at ${currentSpeed} km/h (Speed Limit: 60 km/h).`,
    });
  };

  const handlePassengerCountChange = (delta: number) => {
    const nextCount = Math.max(0, Math.min(bus.capacity, occupancy + delta));
    setOccupancy(nextCount);
    const engine = getSyncEngine();
    const updated = engine.getBuses().map((b) =>
      b.id === bus.id ? { ...b, occupancy: nextCount } : b
    );
    // Broadcast
    engine.resetDemoData;
  };

  const handleToggleDoors = () => {
    if (speed > 5 && doorsLocked) {
      alert("⚠️ SAFETY INTERLOCK: Cannot unlock cabin doors while vehicle is moving!");
      return;
    }
    setDoorsLocked(!doorsLocked);
    playAnnouncement(doorsLocked ? "Doors opening for passenger boarding." : "Doors closing and locked for transit.");
  };

  const playAnnouncement = (text: string) => {
    setAnnouncementMsg(text);
    setTimeout(() => {
      setAnnouncementMsg(null);
    }, 4500);
  };

  const handleDriverSOS = async (reason = "Driver Emergency SOS Broadcast") => {
    setIsSosActive(true);
    await getSyncEngine().triggerSOS({
      id: `alert-driver-${Date.now()}`,
      tripId: `trip-driver-${bus.id}`,
      busId: bus.id,
      passengerName: `Driver ${bus.driverName}`,
      type: "sos",
      location: bus.currentLocation,
      timestamp: Date.now(),
      status: "open",
      message: `${reason}. Priority vehicle intercept initiated.`,
    });
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
      <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-white/15 shadow-2xl flex flex-wrap items-center justify-between gap-4 bg-slate-900/90">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(34,211,238,0.4)]">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Pilot Cockpit: {bus.id}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-400/30">
                {bus.plateNumber}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Pilot: <strong className="text-white">{bus.driverName}</strong> • {bus.routeName}
            </p>
          </div>
        </div>

        {/* Live Metrics: Shift Clock & Interlock */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="px-3 py-1.5 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[9px] uppercase font-bold text-slate-400">Shift Elapsed</div>
              <div className="text-xs font-mono font-bold text-white">{formatShiftTime(shiftSeconds)}</div>
            </div>
          </div>

          <div
            className={`px-3 py-1.5 rounded-2xl border flex items-center gap-2 ${
              doorsLocked
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-amber-500/10 border-amber-500/30 text-amber-300"
            }`}
          >
            {doorsLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            <div>
              <div className="text-[9px] uppercase font-bold">Door Status</div>
              <div className="text-xs font-bold font-mono">{doorsLocked ? "LOCKED & SECURED" : "DOORS OPEN"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* PA Public Announcement Bar */}
      {announcementMsg && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 text-white flex items-center justify-between gap-3 shadow-xl animate-fade-in">
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 animate-pulse shrink-0" />
            <span className="text-xs sm:text-sm font-bold">📢 PA Announcement: {announcementMsg}</span>
          </div>
          <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded font-mono">Broadcasting</span>
        </div>
      )}

      {/* Main Cockpit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Telemetry Gauges & Speed Controls (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Speedometer & Accelerometer Card */}
          <div
            className={`glass-panel p-6 rounded-3xl border shadow-2xl transition-all relative overflow-hidden ${
              isOverspeed ? "border-red-500/80 bg-red-950/20" : "border-white/15 bg-slate-900/80"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Live Digital Telematics Gauge
              </span>
              <span
                className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isOverspeed
                    ? "bg-red-500/20 text-red-300 border-red-400 animate-pulse"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                }`}
              >
                {isOverspeed ? "⚠️ OVERSPEED WARNING" : "CRUISE SPEED NORMAL"}
              </span>
            </div>

            {/* Speed Display Dial */}
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span
                    className={`text-6xl sm:text-7xl font-black font-mono tracking-tighter ${
                      isOverspeed ? "text-red-400 glow-danger" : "text-cyan-400 glow-cyan"
                    }`}
                  >
                    {speed}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-slate-400">KM/H</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">Speed Limit: 60 KM/H</div>
              </div>

              {/* Quick Speed Adjusters */}
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <div className="text-[11px] font-bold text-slate-400 text-center sm:text-left">
                  Throttle Control (Simulation)
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSpeedChange(10)}
                    className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition active:scale-95"
                  >
                    +10 km/h
                  </button>
                  <button
                    onClick={() => handleSpeedChange(5)}
                    className="px-3 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs transition active:scale-95"
                  >
                    +5 km/h
                  </button>
                  <button
                    onClick={() => handleSpeedChange(-5)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition active:scale-95"
                  >
                    -5 km/h
                  </button>
                  <button
                    onClick={() => setSpeed(0)}
                    className="px-3 py-2 rounded-xl bg-red-600/80 hover:bg-red-500 text-white font-bold text-xs transition active:scale-95"
                  >
                    🛑 Stop (0)
                  </button>
                </div>
              </div>
            </div>

            {/* Visual Speed Slider */}
            <div className="mt-4">
              <input
                type="range"
                min="0"
                max="90"
                value={speed}
                onChange={(e) => handleSpeedChange(parseInt(e.target.value) - speed)}
                className="w-full accent-cyan-400 h-2 bg-slate-950 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Route Navigation & Next Stop Card */}
          <div className="glass-panel p-5 rounded-3xl border border-white/15 shadow-xl bg-slate-900/80">
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Upcoming Corridor Stop
                </h3>
              </div>
              <button
                onClick={handleAdvanceNextStop}
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1"
              >
                <span>Arrive & Announce</span>
                <RotateCw className="w-3 h-3" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-cyan-500/25 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase font-bold text-cyan-400">Next Destination Hub</div>
                <div className="text-base sm:text-lg font-black text-white">{bus.nextStop}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Estimated Arrival: <strong className="text-cyan-300">~{bus.etaMinutes} minutes</strong> (Traffic Normal)
                </div>
              </div>

              <button
                onClick={() => playAnnouncement(`Next stop is ${bus.nextStop}. Passengers, please check your belongings.`)}
                className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Broadcast Stop Notice</span>
              </button>
            </div>
          </div>

          {/* Door Interlock & Passenger Management */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Door Control */}
            <div className="glass-panel p-4 rounded-2xl border border-white/15 shadow-md flex flex-col justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-300">Pneumatic Door System</div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Interlocked with vehicle velocity for passenger safety.
                </p>
              </div>

              <button
                onClick={handleToggleDoors}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                  doorsLocked
                    ? "bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"
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
            <div className="glass-panel p-4 rounded-2xl border border-white/15 shadow-md flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-300">Cabin Occupancy</div>
                  <div className="text-lg font-black text-white font-mono">
                    {occupancy} / {bus.capacity} Seats
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handlePassengerCountChange(1)}
                  className="py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition"
                >
                  + Boarding (1)
                </button>
                <button
                  onClick={() => handlePassengerCountChange(-1)}
                  className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 text-xs font-bold transition"
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
          <div className="glass-panel p-5 rounded-3xl border border-white/15 shadow-2xl bg-slate-900/90 flex flex-col gap-3.5 relative overflow-hidden">
            {/* Camera Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    On-Board Bus CCTV Camera
                    <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                      REC
                    </span>
                  </h3>
                </div>
              </div>

              {/* Source Controls */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center p-0.5 rounded-xl bg-slate-950/80 border border-white/10 text-[10px] font-bold">
                  <button
                    onClick={() => setFeedMode("ip_stream")}
                    className={`px-2 py-0.5 rounded-lg transition ${
                      feedMode === "ip_stream"
                        ? "bg-cyan-500 text-slate-950 font-black"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    IP Stream
                  </button>
                  <button
                    onClick={() => setFeedMode("webcam")}
                    className={`px-2 py-0.5 rounded-lg transition ${
                      feedMode === "webcam"
                        ? "bg-cyan-500 text-slate-950 font-black"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Webcam
                  </button>
                  <button
                    onClick={() => setFeedMode("simulation")}
                    className={`px-2 py-0.5 rounded-lg transition ${
                      feedMode === "simulation"
                        ? "bg-cyan-500 text-slate-950 font-black"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    AI HUD
                  </button>
                </div>

                <button
                  onClick={() => setIsConfigModalOpen(true)}
                  className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-cyan-300 border border-white/10 transition"
                  title="Configure Bus IP Camera URLs"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Channel Tabs */}
            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-white/10 text-[10px] font-bold">
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
                      ? "bg-cyan-500 text-slate-950 font-black shadow-md"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {ch.label}
                </button>
              ))}
            </div>

            {/* Error banner if webcam blocked */}
            {webcamError && (
              <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-[10px] text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{webcamError}</span>
              </div>
            )}

            {/* Main Embedded Camera Viewfinder Screen */}
            <div
              className={`relative aspect-video rounded-2xl overflow-hidden bg-black border shadow-inner flex items-center justify-center ${
                isNightMode ? "border-emerald-500/50" : "border-cyan-500/40"
              }`}
            >
              {/* Real Hardware Webcam Feed */}
              {feedMode === "webcam" && streamRef.current ? (
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
                /* Real IP Camera / Bus NVR Stream */
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
                /* Simulated High-Tech Bus Channel Visuals */
                <div
                  className={`w-full h-full relative flex flex-col items-center justify-center p-4 select-none ${
                    isNightMode
                      ? "bg-gradient-to-b from-emerald-950/40 via-slate-950 to-emerald-950/30 text-emerald-400"
                      : "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-cyan-400"
                  }`}
                >
                  {/* Channel-Specific Graphic Simulator */}
                  {camChannel === "driver" && (
                    <div className="text-center space-y-1">
                      <div className="w-16 h-16 rounded-2xl border-2 border-cyan-400/50 mx-auto relative flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                        <Eye className="w-8 h-8 text-cyan-300 animate-pulse" />
                        <span className="absolute -top-2 -right-2 text-[8px] bg-emerald-500 text-slate-950 px-1 py-0.2 rounded font-black">
                          96%
                        </span>
                      </div>
                      <div className="text-xs font-black text-white">Driver Facial & Gaze Tracker</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        DMS Score: {dmsScore}% • Eyes On Forward Corridor
                      </div>
                    </div>
                  )}

                  {camChannel === "road" && (
                    <div className="text-center space-y-1">
                      <div className="w-24 h-12 border-b-2 border-dashed border-cyan-400/70 mx-auto flex items-center justify-center">
                        <Navigation className="w-6 h-6 text-cyan-300 transform -rotate-45" />
                      </div>
                      <div className="text-xs font-black text-white">Forward Road Windshield HUD</div>
                      <div className="text-[10px] text-emerald-400 font-mono">
                        Lane Tracking: LOCKED • Radar Clearance: 42m
                      </div>
                    </div>
                  )}

                  {camChannel === "cabin" && (
                    <div className="text-center space-y-1">
                      <div className="w-16 h-12 rounded-xl border border-white/20 mx-auto flex items-center justify-center bg-slate-900/60">
                        <Users className="w-6 h-6 text-blue-300" />
                      </div>
                      <div className="text-xs font-black text-white">Passenger Cabin 360° CCTV</div>
                      <div className="text-[10px] text-cyan-300 font-mono">
                        AI Occupancy: {occupancy} Passengers • Aisle Clear
                      </div>
                    </div>
                  )}

                  {camChannel === "door" && (
                    <div className="text-center space-y-1">
                      <div className="w-16 h-12 rounded-xl border border-white/20 mx-auto flex items-center justify-center bg-slate-900/60">
                        {doorsLocked ? (
                          <Lock className="w-6 h-6 text-amber-400" />
                        ) : (
                          <Unlock className="w-6 h-6 text-emerald-400" />
                        )}
                      </div>
                      <div className="text-xs font-black text-white">Pneumatic Door Entry Monitor</div>
                      <div className="text-[10px] text-slate-300 font-mono">
                        Boarding Zone: {doorsLocked ? "SECURED (CLOSED)" : "ACTIVE BOARDING"}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Dynamic Camera HUD Overlays */}
              <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between">
                {/* Top HUD Bar */}
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="bg-black/75 backdrop-blur px-2 py-0.5 rounded text-cyan-300 border border-white/10">
                    CAM: {bus.id} / CH-{camChannel.toUpperCase()}
                  </span>
                  <span className="bg-black/75 backdrop-blur px-2 py-0.5 rounded text-white border border-white/10">
                    {clientTimestamp}
                  </span>
                </div>

                {/* Center Reticle */}
                <div className="self-center w-24 h-24 border border-cyan-400/20 rounded-2xl relative pointer-events-none">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400"></div>
                </div>

                {/* Bottom HUD Bar */}
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="bg-black/75 backdrop-blur px-2 py-0.5 rounded text-emerald-400 border border-white/10">
                    SPEED: {speed} KM/H • GPS VALID
                  </span>
                  <span className="bg-black/75 backdrop-blur px-2 py-0.5 rounded text-slate-300 border border-white/10">
                    🔒 AES-256 · 24H PURGE
                  </span>
                </div>
              </div>

              {/* Snapshot confirmation toast */}
              {capturedSnap && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-3 animate-fade-in z-20">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-1" />
                  <span className="text-xs font-bold text-white">Incident Snapshot Captured!</span>
                  <span className="text-[10px] text-cyan-300 font-mono">Encrypted & Attached to Trip Evidence Log</span>
                </div>
              )}
            </div>

            {/* Quick Action Control Strip */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setIsNightMode(!isNightMode)}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 border ${
                  isNightMode
                    ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300"
                    : "bg-slate-950/80 border-white/10 text-slate-300 hover:text-white"
                }`}
              >
                {isNightMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                <span>{isNightMode ? "Night: ON" : "Night Vision"}</span>
              </button>

              <button
                onClick={handleCaptureSnapshot}
                className="py-1.5 px-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-white/10 text-cyan-300 text-[11px] font-bold transition flex items-center justify-center gap-1"
                title="Capture timestamped snapshot"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Snap Photo</span>
              </button>

              <button
                onClick={() => setIsDmsCameraOpen(true)}
                className="py-1.5 px-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-400/40 text-cyan-300 text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-sm"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Expand</span>
              </button>
            </div>
          </div>

          {/* Driver Emergency SOS & Hazard Broadcast */}
          <div className="glass-panel p-5 rounded-3xl border border-red-500/40 shadow-2xl bg-gradient-to-b from-red-950/20 to-slate-900 flex flex-col gap-3.5">
            <div className="flex items-center gap-2 text-red-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-xs font-black uppercase tracking-wider">
                Pilot Emergency & Hazard Console
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Instantly broadcast emergency distress, route hazards, or mechanical faults directly to 24/7 Fleet Command.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleDriverSOS("Driver Accident / Vehicle Collision")}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
              >
                <Radio className="w-4 h-4 animate-ping" />
                <span>🚨 ACCIDENT / CRASH SOS</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDriverSOS("Medical Emergency On Board Bus")}
                  className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/15 text-white text-[11px] font-bold transition flex items-center justify-center gap-1.5"
                >
                  <span>🏥 Medical Aid</span>
                </button>
                <button
                  onClick={() => handleDriverSOS("Mechanical Breakdown / Engine Fault")}
                  className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/15 text-white text-[11px] font-bold transition flex items-center justify-center gap-1.5"
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
    </div>
  );
}
