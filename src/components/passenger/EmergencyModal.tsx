"use client";

import React, { useState, useEffect } from "react";
import { Alert, Trip, Bus } from "@/types";
import CameraModal from "@/components/common/CameraModal";
import {
  ShieldAlert,
  PhoneCall,
  MapPin,
  CheckCircle2,
  X,
  AlertTriangle,
  Radio,
  Clock,
  Send,
  Camera,
  Trash2,
} from "lucide-react";

type EmergencyType = "sos" | "medical" | "harassment";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSOS: (type: EmergencyType, customNote?: string) => void;
  activeAlert?: Alert | null;
  trip?: Trip;
  bus?: Bus;
  onCancelSOS?: () => void;
}

export default function EmergencyModal({
  isOpen,
  onClose,
  onConfirmSOS,
  activeAlert,
  trip,
  bus,
  onCancelSOS,
}: EmergencyModalProps) {
  const [selectedType, setSelectedType] = useState<EmergencyType>("sos");
  const [customNote, setCustomNote] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [photoEvidence, setPhotoEvidence] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);

  const handleImmediateDispatch = React.useCallback(() => {
    if (isDispatching) return;
    setIsDispatching(true);
    setCountdown(null);
    onConfirmSOS(selectedType, customNote);
    setTimeout(() => setIsDispatching(false), 1500);
  }, [isDispatching, onConfirmSOS, selectedType, customNote]);

  // Auto dispatch timer if not already dispatched
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && !activeAlert && countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (countdown === 0 && !activeAlert) {
      handleImmediateDispatch();
    }
    return () => clearTimeout(timer);
  }, [isOpen, countdown, activeAlert, handleImmediateDispatch]);

  if (!isOpen) return null;

  const isAlertActive = Boolean(activeAlert && activeAlert.status !== "resolved");

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-md rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all border ${
          isAlertActive
            ? "glass-panel-danger border-red-500/80 shadow-[0_0_50px_rgba(239,68,68,0.4)]"
            : "glass-panel border-white/20"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-900/50 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {isAlertActive ? (
          /* ACTIVE EMERGENCY BROADCAST SCREEN */
          <div className="text-center py-2">
            <div className="w-20 h-20 mx-auto rounded-full bg-red-600/30 border-2 border-red-500 flex items-center justify-center mb-4 animate-sos-pulse">
              <ShieldAlert className="w-10 h-10 text-red-400 animate-bounce" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold uppercase mb-2">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>LIVE SOS SIGNAL BROADCASTING</span>
            </div>

            <h3 className="text-2xl font-black text-white glow-red">
              Help Is Being Dispatched
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
              Your exact GPS location and seat number have been transmitted to the Fleet Safety Command and emergency responders.
            </p>

            {/* Live Dispatch Status Pill */}
            <div className="my-5 bg-slate-900/90 rounded-2xl p-4 text-left border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Response Status:</span>
                <span className="font-bold text-amber-300 uppercase flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  {activeAlert?.status === "acknowledged"
                    ? "Operator Acknowledged"
                    : "Awaiting Operator Response"}
                </span>
              </div>

              {activeAlert?.operatorNotes && (
                <div className="text-xs bg-slate-950 p-2.5 rounded-xl border border-cyan-500/30 text-cyan-200">
                  <b>Operator Note:</b> {activeAlert.operatorNotes}
                </div>
              )}

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">GPS Coordinates:</span>
                <span className="font-mono text-slate-200 text-[11px]">
                  {activeAlert?.location?.lat.toFixed(4)}, {activeAlert?.location?.lng.toFixed(4)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Bus Unit & Seat:</span>
                <span className="font-semibold text-white">
                  {trip?.busId || "BUS-42A"} • Seat {trip?.seatNumber || "14B"}
                </span>
              </div>
            </div>

            {/* Direct Helpline Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <a
                href="tel:112"
                className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/30 transition"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Police (112)</span>
              </a>
              <a
                href={`tel:${trip?.emergencyContact.phone || "+919876543210"}`}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-cyan-500/30 transition"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Guardian</span>
              </a>
            </div>

            {onCancelSOS && (
              <button
                onClick={onCancelSOS}
                className="text-xs text-slate-400 hover:text-slate-200 underline transition"
              >
                False Alarm? Mark Resolved / Cancel Alert
              </button>
            )}
          </div>
        ) : (
          /* PRE-TRIGGER SOS CONFIRMATION SCREEN */
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  Emergency SOS Activation
                </h3>
                <p className="text-xs text-slate-300">
                  Instantly alerts 24/7 Command Center with live bus telemetry
                </p>
              </div>
            </div>

            {/* Emergency Type Selector */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Select Nature of Emergency
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: "sos", label: "General SOS", icon: "🚨" },
                    { id: "medical", label: "Medical Crisis", icon: "🏥" },
                    { id: "harassment", label: "Safety / Threat", icon: "🛡️" },
                  ] as const
                ).map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                      selectedType === type.id
                        ? "bg-red-500/20 border-red-500 text-white font-bold shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                        : "bg-slate-900/60 border-white/10 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <span className="text-xl">{type.icon}</span>
                    <span className="text-[11px] leading-tight">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional note & Camera Evidence */}
            <div className="mb-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Quick Details (Optional)
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. Passenger unwell / reckless driver"
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-400"
                />
              </div>

              {/* Camera Evidence Capture Button */}
              <div>
                {photoEvidence ? (
                  <div className="p-2.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={photoEvidence}
                        alt="Evidence snapshot"
                        className="w-12 h-10 object-cover rounded-lg border border-cyan-400/40"
                      />
                      <div>
                        <p className="text-[11px] font-bold text-cyan-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Photo Evidence Attached
                        </p>
                        <p className="text-[9px] text-slate-400 font-mono">
                          GPS Watermarked • Transmitting with SOS
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPhotoEvidence(null)}
                      className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <span>Open Live Camera to Attach Incident Evidence</span>
                  </button>
                )}
              </div>
            </div>

            {/* Trigger Button */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleImmediateDispatch}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-red-600/40 transition-all transform active:scale-98 flex items-center justify-center gap-2"
              >
                <Radio className="w-4 h-4 animate-ping" />
                <span>CONFIRM & TRANSMIT SOS NOW</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition"
              >
                Cancel / Return to Ride
              </button>
            </div>
          </div>
        )}

        {/* Live Camera Viewfinder Modal */}
        <CameraModal
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onCapture={(dataUrl) => setPhotoEvidence(dataUrl)}
          title="Emergency Incident Camera"
          subtitle={`Attaching live visual evidence to ${bus?.id || "BUS-42A"} SOS dispatch`}
          watermarkText={`SOS INCIDENT EVIDENCE • ${bus?.id || "BUS-42A"}`}
        />
      </div>
    </div>
  );
}
