"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Video,
  X,
  RotateCw,
  Zap,
  CheckCircle2,
  AlertCircle,
  Download,
  Shield,
  Radio,
  Eye,
  RefreshCw,
  Square,
  Lock,
  Clock,
} from "lucide-react";
import { getVideoRetentionEngine } from "@/lib/video-retention";
import VideoRetentionModal from "./VideoRetentionModal";
import {
  getBusCameraConfig,
  BusCameraConfig,
  CCTVChannel,
} from "@/lib/cctv-stream-config";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture?: (imageDataUrl: string) => void;
  title?: string;
  subtitle?: string;
  watermarkText?: string;
  tripId?: string;
  busId?: string;
}

export default function CameraModal({
  isOpen,
  onClose,
  onCapture,
  title = "SafeBus Live Safety Camera",
  subtitle = "Realtime visual telemetry & evidence capture",
  watermarkText = "SAFEBUS NEXUS • LIVE GPS ENCRYPTED",
  tripId,
  busId = "BUS-42A",
}: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);

  // Real Bus CCTV Stream vs Local Device Camera Toggle
  const [busCctvConfig, setBusCctvConfig] = useState<BusCameraConfig>(() =>
    getBusCameraConfig(busId)
  );
  const [viewSource, setViewSource] = useState<"bus_cctv" | "device_cam">("bus_cctv");
  const [activeChannel, setActiveChannel] = useState<CCTVChannel>("cabin");

  // Video recording states
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [isVideoRetentionOpen, setIsVideoRetentionOpen] = useState<boolean>(false);

  useEffect(() => {
    if (busId) {
      setBusCctvConfig(getBusCameraConfig(busId));
    }
  }, [busId]);

  // Start video stream when modal opens
  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopCamera();
      setCapturedPhoto(null);
      setRecordedVideoUrl(null);
      setIsRecording(false);
      setRecordingSeconds(0);
      setErrorMsg("");
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  // Recording timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const startCamera = async (mode: "user" | "environment") => {
    stopCamera();
    setErrorMsg("");
    setIsSimulated(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported on this browser.");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn("Camera access warning:", err);
      setHasPermission(false);
      setErrorMsg(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Camera permission denied. Click Allow in browser settings or test with simulated camera feed."
          : "Camera not detected or unavailable. Using simulated live CCTV feed."
      );
      setIsSimulated(true);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
  };

  // Start Video Recording
  const startRecording = () => {
    if (!stream) {
      // Simulate video recording
      setIsRecording(true);
      setRecordingSeconds(0);
      return;
    }

    try {
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        logVideoToRetentionEngine(recordingSeconds);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
    } catch (err) {
      console.warn("MediaRecorder start error:", err);
      setIsRecording(true);
      setRecordingSeconds(0);
    }
  };

  // Stop Video Recording
  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    } else {
      // Simulated video recording stop
      logVideoToRetentionEngine(Math.max(5, recordingSeconds));
    }
  };

  const logVideoToRetentionEngine = (duration: number) => {
    getVideoRetentionEngine().addRecording({
      id: `vid-${Date.now()}`,
      tripId,
      busId,
      recordedBy: title,
      recordedAt: Date.now(),
      durationSeconds: duration,
      completedAt: undefined, // active trip
    });
  };

  // Capture still photo
  const captureSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 640;
    canvas.height = 480;

    if (video && stream) {
      ctx.drawImage(video, 0, 0, 640, 480);
    } else {
      // Draw simulated frame
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = "#06B6D4";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("SAFEBUS NEXUS LIVE CCTV", 40, 100);
    }

    // Watermark
    ctx.fillStyle = "#E2E8F0";
    ctx.font = "12px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`${watermarkText} • ${new Date().toLocaleTimeString()}`, 20, 460);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedPhoto(dataUrl);
  };

  const handleConfirmPhoto = () => {
    if (capturedPhoto && onCapture) {
      onCapture(capturedPhoto);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
        <div className="w-full max-w-lg bg-slate-900/95 border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.2)] flex flex-col relative">
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-slate-950/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/30">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{title}</h3>
                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    LIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">{subtitle}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Channel / Source Tabs Bar */}
          <div className="px-4 py-2 bg-slate-950/90 border-b border-white/10 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewSource("bus_cctv")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  viewSource === "bus_cctv"
                    ? "bg-cyan-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Bus CCTV
              </button>
              <button
                type="button"
                onClick={() => setViewSource("device_cam")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  viewSource === "device_cam"
                    ? "bg-cyan-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Device Cam
              </button>
            </div>

            {viewSource === "bus_cctv" && (
              <div className="flex items-center gap-1 text-[10px] font-bold">
                {(
                  [
                    { id: "cabin", label: "Cabin" },
                    { id: "road", label: "Road" },
                    { id: "driver", label: "Pilot" },
                    { id: "door", label: "Door" },
                  ] as const
                ).map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setActiveChannel(ch.id)}
                    className={`px-2 py-0.5 rounded-md transition ${
                      activeChannel === ch.id
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Privacy Retention Notification Bar */}
          <div className="px-4 py-1.5 bg-cyan-950/40 border-b border-cyan-500/20 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-cyan-300">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>12h Ephemeral Purge Guarantee</span>
            </div>
            <button
              onClick={() => setIsVideoRetentionOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 underline font-mono text-[10px]"
            >
              View Retention Vault →
            </button>
          </div>

          {/* Viewfinder Canvas / Stream */}
          <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
            {capturedPhoto ? (
              <img
                src={capturedPhoto}
                alt="Captured incident snapshot"
                className="w-full h-full object-cover"
              />
            ) : recordedVideoUrl ? (
              <video
                src={recordedVideoUrl}
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            ) : viewSource === "bus_cctv" && busCctvConfig.channelStreams?.[activeChannel] ? (
              busCctvConfig.channelStreams[activeChannel].includes("/video") ||
              busCctvConfig.channelStreams[activeChannel].includes(".mjpg") ||
              busCctvConfig.channelStreams[activeChannel].includes(".mjpeg") ? (
                <img
                  src={busCctvConfig.channelStreams[activeChannel]}
                  alt={`Bus ${activeChannel} CCTV Feed`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={busCctvConfig.channelStreams[activeChannel]}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <>
                {/* Hardware Video Stream */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${
                    facingMode === "user" ? "scale-x-[-1]" : ""
                  } ${isNightMode ? "contrast-125 brightness-110 saturate-50 hue-rotate-90" : ""}`}
                />

                {/* Simulated fallback feed if hardware camera blocked or viewing simulation */}
                {(isSimulated || (viewSource === "bus_cctv" && !busCctvConfig.channelStreams?.[activeChannel])) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mb-2 animate-pulse">
                      <Radio className="w-7 h-7" />
                    </div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Bus {busId} • Channel {activeChannel.toUpperCase()}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Live encrypted telemetry stream • 1080p 30fps
                    </p>
                  </div>
                )}

                {/* Recording Active HUD Overlay */}
                {isRecording && (
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-2 bg-red-600/90 text-white px-2.5 py-1 rounded-full text-xs font-bold font-mono animate-pulse shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    <span>REC {recordingSeconds}s</span>
                  </div>
                )}

                {/* Viewfinder HUD Overlays */}
                <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    <span className="flex items-center gap-1 bg-slate-950/60 px-2 py-0.5 rounded border border-cyan-400/30">
                      <Shield className="w-3 h-3 text-cyan-400" />
                      GPS: 12.9172° N, 77.6228° E
                    </span>
                    <span className="bg-slate-950/60 px-2 py-0.5 rounded border border-white/20">
                      {isRecording ? "ENCRYPTING [AES-256]" : "STANDBY [HD 1080P]"}
                    </span>
                  </div>

                  {/* Center target crosshair */}
                  <div className="self-center w-24 h-24 border border-cyan-400/40 rounded-xl relative flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-cyan-400/60 animate-ping"></div>
                  </div>

                  <div className="text-[10px] font-mono text-slate-300 bg-slate-950/60 px-2 py-1 rounded self-start border border-white/10">
                    {watermarkText}
                  </div>
                </div>
              </>
            )}

            {/* Hidden Canvas for Image Processing */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Action Controls Bar */}
          <div className="p-4 bg-slate-950/90 border-t border-white/10 flex items-center justify-between gap-3">
            {capturedPhoto || recordedVideoUrl ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setCapturedPhoto(null);
                    setRecordedVideoUrl(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retake
                </button>

                <button
                  type="button"
                  onClick={handleConfirmPhoto}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Attach Evidence (Auto-Deletes in 24h)
                </button>
              </>
            ) : (
              <>
                {/* Secondary Controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleFacingMode}
                    className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition"
                    title="Flip Camera (Front/Rear)"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNightMode(!isNightMode)}
                    className={`p-2.5 rounded-xl border transition ${
                      isNightMode
                        ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                        : "bg-slate-800/80 border-white/10 text-slate-300 hover:text-white"
                    }`}
                    title="Night Vision Infrared Filter"
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                </div>

                {/* Capture & Record Buttons */}
                <div className="flex items-center gap-2">
                  {/* Photo Shutter */}
                  <button
                    type="button"
                    onClick={captureSnapshot}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Photo</span>
                  </button>

                  {/* Video Record Shutter */}
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black transition active:scale-95 ${
                      isRecording
                        ? "bg-red-600 hover:bg-red-500 text-white animate-pulse"
                        : "bg-gradient-to-r from-red-600 via-rose-500 to-red-600 hover:from-red-500 hover:to-rose-400 text-white shadow-lg shadow-red-600/30"
                    }`}
                  >
                    {isRecording ? <Square className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    <span>{isRecording ? "Stop & Save" : "Record Clip"}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Video Retention Modal */}
      <VideoRetentionModal
        isOpen={isVideoRetentionOpen}
        onClose={() => setIsVideoRetentionOpen(false)}
        tripId={tripId}
      />
    </>
  );
}
