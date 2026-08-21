"use client";

import React, { useState, useRef } from "react";
import { Trip, Bus } from "@/types";
import Link from "next/link";
import {
  Ticket,
  QrCode,
  Shield,
  Download,
  Share2,
  CheckCircle2,
  X,
  MapPin,
  Clock,
  Bus as BusIcon,
  User,
  CreditCard,
  Sparkles,
  Phone,
  Camera,
  Video,
  ExternalLink,
} from "lucide-react";

import CameraModal from "@/components/common/CameraModal";

interface DigitalTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  bus?: Bus;
}

export default function DigitalTicketModal({
  isOpen,
  onClose,
  trip,
  bus,
}: DigitalTicketModalProps) {
  const ticketRef = useRef<HTMLDivElement | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  if (!isOpen) return null;

  const ticketId = `NEXUS-TKT-${trip.tripId.replace("trip-", "").slice(-6).toUpperCase() || "8821X9"}`;
  const formattedDate = new Date(trip.startedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedTime = new Date(trip.startedAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePrintDownload = () => {
    window.print();
  };

  const handleShare = () => {
    const url = `${window.location.origin}/ticket?id=${trip.tripId}`;
    if (navigator.share) {
      navigator.share({
        title: `SafeBus E-Ticket: ${trip.routeName}`,
        text: `Live SafeBus Ticket for ${trip.passengerName} (${trip.routeName}, Seat ${trip.seatNumber}). Scan or click link to view live camera & GPS tracking:`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      alert("📋 Live ticket inspection link copied to clipboard!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900/95 border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.25)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/30">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Digital Smart E-Ticket</h3>
              <p className="text-[10px] text-cyan-300 font-mono">PNR: {ticketId}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Ticket Body */}
        <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-4">
          {/* Main Printable Ticket Card */}
          <div
            ref={ticketRef}
            className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/40 rounded-3xl p-5 relative overflow-hidden shadow-2xl"
          >
            {/* Top Badge: Transit Authority & Validity */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-black tracking-tight text-white">
                  SafeBus <span className="text-cyan-400">Nexus</span>
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE TICKET
              </span>
            </div>

            {/* Route & Destination */}
            <div className="py-4">
              <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                {trip.routeName}
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] text-slate-400">Origin Stop</div>
                  <div className="text-sm font-black text-white">{trip.originStop}</div>
                </div>
                <div className="flex flex-col items-center px-2">
                  <div className="text-[9px] text-cyan-400 font-mono">DIRECT</div>
                  <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 relative my-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white absolute -top-0.5 right-0"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Destination Hub</div>
                  <div className="text-sm font-black text-white">{trip.destinationStop}</div>
                </div>
              </div>
            </div>

            {/* Ticket Notches (Ticket Cutout visual effect) */}
            <div className="relative flex items-center justify-between my-2 -mx-5 px-3">
              <div className="w-4 h-6 bg-slate-900 border-r border-cyan-500/40 rounded-r-full -ml-3"></div>
              <div className="flex-1 border-b border-dashed border-white/20 mx-2"></div>
              <div className="w-4 h-6 bg-slate-900 border-l border-cyan-500/40 rounded-l-full -mr-3"></div>
            </div>

            {/* Passenger & Vehicle Details Grid */}
            <div className="grid grid-cols-2 gap-3 py-3 text-xs border-b border-white/10">
              <div>
                <div className="text-[10px] text-slate-400">Passenger</div>
                <div className="font-bold text-white flex items-center gap-1 mt-0.5">
                  <User className="w-3 h-3 text-cyan-400" />
                  <span>{trip.passengerName}</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400">Seat Number</div>
                <div className="font-mono font-black text-cyan-300 text-sm mt-0.5">
                  {trip.seatNumber} (Assigned)
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400">Assigned Bus / Plate</div>
                <div className="font-mono text-white text-[11px] mt-0.5 flex items-center gap-1">
                  <BusIcon className="w-3 h-3 text-cyan-400" />
                  <span>{bus?.plateNumber || "KA 01 F 8821"}</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400">Departure Time</div>
                <div className="font-mono text-slate-200 text-[11px] mt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>{formattedTime}, {formattedDate}</span>
                </div>
              </div>
            </div>

            {/* Live Interactive QR Code & Scanner Box */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/70 p-3.5 rounded-2xl border border-cyan-500/30">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-[11px] font-bold text-white flex items-center justify-center sm:justify-start gap-1">
                  <QrCode className="w-4 h-4 text-cyan-400" />
                  <span>Live Telematics QR Code</span>
                </div>
                <p className="text-[10px] text-slate-400 max-w-[200px]">
                  Scannable by conductor or family to view live passenger details, camera feed, and 24h saved videos.
                </p>
                <div className="text-sm font-black text-emerald-400 font-mono pt-1">₹45.00 Paid</div>
              </div>

              {/* QR Box with Link to Verification Portal */}
              <Link
                href={`/ticket?id=${trip.tripId}`}
                onClick={onClose}
                className="p-2 bg-white rounded-2xl shadow-md shrink-0 flex flex-col items-center hover:scale-105 transition group cursor-pointer"
                title="Click to Simulate Scanning QR Code"
              >
                <QrCode className="w-16 h-16 text-slate-950" />
                <span className="text-[8px] font-mono font-bold text-blue-700 mt-0.5 flex items-center gap-0.5">
                  <span>TAP TO SCAN</span>
                  <ExternalLink className="w-2 h-2" />
                </span>
              </Link>
            </div>

            {/* 3 Verification Feature Highlights */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10 text-center">
              <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5">
                <User className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1" />
                <div className="text-[9px] font-bold text-white">Customer Data</div>
                <div className="text-[8px] text-slate-400">Verified ID & Seat</div>
              </div>

              <button
                onClick={() => setIsCameraOpen(true)}
                className="p-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 transition text-center cursor-pointer group"
                title="Launch Live On-Board Bus Camera Feed"
              >
                <Camera className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1 group-hover:scale-110 transition" />
                <div className="text-[9px] font-bold text-cyan-300">Live Cam View</div>
                <div className="text-[8px] text-cyan-200/80">Tap to Watch</div>
              </button>

              <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5">
                <Video className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1" />
                <div className="text-[9px] font-bold text-white">Saved 24h Videos</div>
                <div className="text-[8px] text-slate-400">Encrypted Vault</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/90 border-t border-white/10 flex items-center justify-between gap-2">
          <button
            onClick={() => setIsCameraOpen(true)}
            className="py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Bus Cam</span>
          </button>

          <Link
            href={`/ticket?id=${trip.tripId}`}
            onClick={onClose}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 text-xs font-bold transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Portal</span>
          </Link>

          <button
            onClick={handleShare}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-white/10"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          <button
            onClick={handlePrintDownload}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-black shadow-lg shadow-cyan-500/25 transition flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Embedded Live Camera Modal for Ticket Passengers */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        tripId={trip.tripId}
        busId={bus?.id || trip.busId || "BUS-42A"}
        title={`Live Bus Camera: ${bus?.id || trip.busId || "BUS-42A"}`}
        subtitle={`Realtime security & cabin view for passenger ${trip.passengerName}`}
      />
    </div>
  );
}
