"use client";

import React, { useState, useEffect } from "react";
import {
  CCTVChannel,
  CCTVFeedMode,
  BusCameraConfig,
  getBusCameraConfig,
  saveBusCameraConfig,
} from "@/lib/cctv-stream-config";
import {
  Camera,
  Video,
  Settings,
  X,
  CheckCircle2,
  Globe,
  Radio,
  Sparkles,
  Server,
  Info,
  RefreshCw,
  Play,
} from "lucide-react";

interface CCTVConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  busId?: string;
  onConfigSaved?: (config: BusCameraConfig) => void;
}

export default function CCTVConfigModal({
  isOpen,
  onClose,
  busId = "BUS-42A",
  onConfigSaved,
}: CCTVConfigModalProps) {
  const [config, setConfig] = useState<BusCameraConfig>({
    busId,
    channelStreams: { driver: "", road: "", cabin: "", door: "" },
    preferredMode: "simulation",
    dvrModel: "Hikvision Mobile Bus NVR",
    rtspGatewayUrl: "",
  });

  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const existing = getBusCameraConfig(busId);
      setConfig(existing);
    }
  }, [isOpen, busId]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveBusCameraConfig(config);
    if (onConfigSaved) onConfigSaved(config);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 1200);
  };

  const handleLoadDemoStreams = () => {
    setConfig({
      ...config,
      preferredMode: "ip_stream",
      channelStreams: {
        driver: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        road: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        cabin: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        door: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
      },
    });
  };

  const handleLoadLocalIPPresets = (ip: string = "192.168.1.100") => {
    setConfig({
      ...config,
      preferredMode: "ip_stream",
      channelStreams: {
        driver: `http://${ip}:8080/video`,
        road: `http://${ip}:8081/video`,
        cabin: `http://${ip}:8082/video`,
        door: `http://${ip}:8083/video`,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900/95 border border-cyan-500/40 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.25)] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Real Bus CCTV & IP Camera Integration</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  {busId}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Configure live RTSP, HLS, WebRTC, or HTTP MJPEG camera feeds from on-bus NVR / IP cams
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

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-5 text-xs text-slate-300">
          {/* Feed Mode Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Active Feed Source
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: "ip_stream",
                  title: "Real IP CCTV Stream",
                  sub: "HTTP / HLS / MJPEG / RTSP Stream",
                  icon: Globe,
                },
                {
                  id: "webcam",
                  title: "Physical Device Cam",
                  sub: "Laptop / Phone / USB Cam",
                  icon: Camera,
                },
                {
                  id: "simulation",
                  title: "AI Edge Simulation",
                  sub: "High-Tech Telemetry HUD",
                  icon: Sparkles,
                },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setConfig({ ...config, preferredMode: mode.id as CCTVFeedMode })}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col gap-1 ${
                    config.preferredMode === mode.id
                      ? "bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.25)]"
                      : "bg-slate-950/60 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <mode.icon
                      className={`w-4 h-4 ${
                        config.preferredMode === mode.id ? "text-cyan-300" : "text-slate-400"
                      }`}
                    />
                    {config.preferredMode === mode.id && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    )}
                  </div>
                  <div className="font-bold text-xs mt-1 text-white">{mode.title}</div>
                  <div className="text-[10px] text-slate-400">{mode.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Presets Strip */}
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/10 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>Quick Preset Configurations:</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLoadDemoStreams}
                className="px-2.5 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-400/30 text-[11px] font-bold transition flex items-center gap-1"
              >
                <Play className="w-3 h-3" />
                <span>Load Live Video Sample Feeds</span>
              </button>

              <button
                onClick={() => handleLoadLocalIPPresets("192.168.1.100")}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 text-[11px] font-bold transition flex items-center gap-1"
              >
                <Server className="w-3 h-3" />
                <span>Local Bus IP (192.168.1.x)</span>
              </button>
            </div>
          </div>

          {/* 4 CCTV Channel Stream URLs Inputs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                4-Channel Real CCTV Camera Stream URLs
              </label>
              <span className="text-[10px] text-cyan-400 font-mono">Supports HTTP MJPEG, HLS (.m3u8), MP4/WebRTC</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Channel 1: Pilot DMS */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300">
                  <span>CH 1: Pilot DMS Camera (Face/Gaze)</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">Driver</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. http://192.168.1.101:8080/video or https://.../stream1.m3u8"
                  value={config.channelStreams.driver}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      channelStreams: { ...config.channelStreams, driver: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              {/* Channel 2: Road Windshield */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300">
                  <span>CH 2: Front Windshield Road Cam</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">Corridor</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. http://192.168.1.102:8080/video or https://.../stream2.m3u8"
                  value={config.channelStreams.road}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      channelStreams: { ...config.channelStreams, road: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              {/* Channel 3: Cabin 360 */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300">
                  <span>CH 3: Passenger Cabin 360° CCTV</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">Cabin</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. http://192.168.1.103:8080/video or https://.../stream3.m3u8"
                  value={config.channelStreams.cabin}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      channelStreams: { ...config.channelStreams, cabin: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              {/* Channel 4: Door Entry */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300">
                  <span>CH 4: Pneumatic Door Entry Cam</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">Door</span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. http://192.168.1.104:8080/video or https://.../stream4.m3u8"
                  value={config.channelStreams.door}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      channelStreams: { ...config.channelStreams, door: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Hardware & NVR Integration Guide Notice */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 flex items-start gap-2.5 text-[11px] text-slate-400">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-slate-200">How to connect physical bus hardware:</strong>
              <p>
                • <strong>Bus NVR (Hikvision / Dahua / CP Plus):</strong> Output channels via on-board mobile NVR Web / HTTP MJPEG endpoint or local RTSP-to-WebRTC gateway.
              </p>
              <p>
                • <strong>Android / iOS Phones as Dashcams:</strong> Run the free <em>IP Webcam</em> app on the phone and enter the IP URL (e.g., <code>http://192.168.x.x:8080/video</code>).
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/90 border-t border-white/10 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 font-mono">
            {savedToast ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                CCTV Settings Saved!
              </span>
            ) : (
              <span>Settings automatically saved to browser storage.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-black shadow-lg shadow-cyan-500/25 transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply & Save Stream</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
