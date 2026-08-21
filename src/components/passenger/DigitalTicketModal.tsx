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
  X,
  Clock,
  Bus as BusIcon,
  User,
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Digital Smart E-Ticket</h3>
              <p className="text-xs text-slate-400 font-mono">PNR: {ticketId}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Ticket Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Main Printable Ticket Card */}
          <div
            ref={ticketRef}
            className="bg-slate-950 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-lg"
          >
            {/* Top Badge: Transit Authority & Validity */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold tracking-tight text-white">
                  SafeBus <span className="text-blue-400">Transit Authority</span>
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                ACTIVE TICKET
              </span>
            </div>

            {/* Route & Destination */}
            <div className="py-4">
              <div className="text-xs font-bold text-blue-400 uppercase tracking-wide">
                {trip.routeName}
              </div>
              <div className="mt-2.5 flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] text-slate-400">Origin Stop</div>
                  <div className="text-sm font-bold text-white">{trip.originStop}</div>
                </div>
                <div className="flex flex-col items-center px-2">
                  <div className="text-[9px] text-slate-400 font-mono">DIRECT</div>
                  <div className="w-12 h-0.5 bg-blue-600 relative my-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white absolute -top-0.5 right-0"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Destination Hub</div>
                  <div className="text-sm font-bold text-white">{trip.destinationStop}</div>
                </div>
              </div>
            </div>

            {/* Ticket Notches */}
            <div className="relative flex items-center justify-between my-2 -mx-5 px-3">
              <div className="w-4 h-6 bg-slate-900 border-r border-slate-800 rounded-r-full -ml-3"></div>
              <div className="flex-1 border-b border-dashed border-slate-800 mx-2"></div>
              <div className="w-4 h-6 bg-slate-900 border-l border-slate-800 rounded-l-full -mr-3"></div>
            </div>

            {/* Passenger & Vehicle Details Grid */}
            <div className="grid grid-cols-2 gap-3 py-3 text-xs border-b border-slate-800">
              <div>
                <div className="text-[10px] text-slate-400">Passenger</div>
                <div className="font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <User className="w-3 h-3 text-blue-400" />
                  <span>{trip.passengerName}</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400">Seat Number</div>
                <div className="font-mono font-bold text-blue-400 text-sm mt-0.5">
                  {trip.seatNumber} (Assigned)
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400">Assigned Bus / Plate</div>
                <div className="font-mono text-white text-xs mt-0.5 flex items-center gap-1.5">
                  <BusIcon className="w-3 h-3 text-blue-400" />
                  <span>{bus?.plateNumber || "KA 01 F 8821"}</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400">Departure Time</div>
                <div className="font-mono text-slate-200 text-xs mt-0.5 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-blue-400" />
                  <span>{formattedTime}, {formattedDate}</span>
                </div>
              </div>
            </div>

            {/* Live Interactive QR Code Box */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-xs font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                  <QrCode className="w-4 h-4 text-blue-400" />
                  <span>Official Transit QR Code</span>
                </div>
                <p className="text-[11px] text-slate-400 max-w-[200px]">
                  Scannable by conductor or family to view passenger details & live GPS tracking.
                </p>
                <div className="text-xs font-bold text-emerald-400 font-mono pt-1">₹45.00 Paid (Confirmed)</div>
              </div>

              {/* QR Box */}
              <Link
                href={`/ticket?id=${trip.tripId}`}
                onClick={onClose}
                className="p-2.5 bg-white rounded-xl shadow shrink-0 flex flex-col items-center hover:scale-105 transition group cursor-pointer"
                title="Click to Simulate Scanning QR Code"
              >
                <QrCode className="w-16 h-16 text-slate-950" />
                <span className="text-[9px] font-mono font-bold text-blue-700 mt-1 flex items-center gap-0.5">
                  <span>TAP TO SCAN</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </Link>
            </div>

            {/* 3 Verification Feature Highlights */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-center">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <User className="w-3.5 h-3.5 text-blue-400 mx-auto mb-1" />
                <div className="text-[10px] font-bold text-white">Customer Data</div>
                <div className="text-[9px] text-slate-400">Verified ID</div>
              </div>

              <button
                onClick={() => setIsCameraOpen(true)}
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 transition text-center cursor-pointer group"
                title="Launch Live On-Board Bus Camera Feed"
              >
                <Camera className="w-3.5 h-3.5 text-blue-400 mx-auto mb-1 group-hover:scale-110 transition" />
                <div className="text-[10px] font-bold text-blue-400">Live Cam View</div>
                <div className="text-[9px] text-slate-400">Watch Stream</div>
              </button>

              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <Video className="w-3.5 h-3.5 text-blue-400 mx-auto mb-1" />
                <div className="text-[10px] font-bold text-white">Saved 24h Videos</div>
                <div className="text-[9px] text-slate-400">Encrypted Vault</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={() => setIsCameraOpen(true)}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Bus Cam</span>
          </button>

          <Link
            href={`/ticket?id=${trip.tripId}`}
            onClick={onClose}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Full Portal</span>
          </Link>

          <button
            onClick={handleShare}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          <button
            onClick={handlePrintDownload}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow transition flex items-center justify-center gap-1.5"
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
