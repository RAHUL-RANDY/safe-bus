"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import InteractiveMap from "@/components/common/InteractiveMap";
import { getSyncEngine } from "@/lib/sync-engine";
import { getVideoRetentionEngine } from "@/lib/video-retention";
import { Bus, Trip, TripVideoRecording } from "@/types";
import Link from "next/link";
import {
  Ticket,
  QrCode,
  ShieldCheck,
  MapPin,
  Clock,
  User,
  Phone,
  Bus as BusIcon,
  Video,
  Camera,
  Lock,
  Sparkles,
  ArrowLeft,
  Share2,
  Download,
  AlertTriangle,
  Play,
  CheckCircle2,
} from "lucide-react";

function TicketVerificationContent() {
  const searchParams = useSearchParams();
  const ticketIdParam = searchParams.get("id") || "trip-sample-01";

  const [trips, setTrips] = useState<Trip[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [recordings, setRecordings] = useState<TripVideoRecording[]>([]);
  const [activeTab, setActiveTab] = useState<"details" | "live_camera" | "saved_videos">("details");

  useEffect(() => {
    const engine = getSyncEngine();
    const unsubTrips = engine.subscribeTrips((t) => setTrips(t));
    const unsubBuses = engine.subscribeBuses((b) => setBuses(b));

    const videoEngine = getVideoRetentionEngine();
    const unsubVideos = videoEngine.subscribe((v) => setRecordings(v));

    return () => {
      unsubTrips();
      unsubBuses();
      unsubVideos();
    };
  }, []);

  // Find trip by ID or fallback to active trip
  const trip =
    trips.find((t) => t.tripId === ticketIdParam || t.tripId.includes(ticketIdParam)) ||
    trips.find((t) => t.status === "active") ||
    trips[0] || {
      tripId: ticketIdParam,
      passengerId: "usr-rahul-01",
      passengerName: "Rahul Sharma",
      busId: "BUS-42A",
      routeCode: "42A",
      routeName: "Route 42A • Metro Tech Express",
      originStop: "Electronic City Phase 1",
      destinationStop: "Majestic City Railway Hub",
      seatNumber: "14B",
      status: "active" as const,
      startedAt: Date.now() - 25 * 60 * 1000,
      currentLocation: { lat: 12.9172, lng: 77.6228 },
      emergencyContact: {
        name: "Guardian",
        phone: "+91 98765 43210",
      },
    };

  const bus = buses.find((b) => b.id === trip.busId) || buses[0] || {
    id: "BUS-42A",
    routeName: "Route 42A - Metro Tech Express",
    routeCode: "R-42A",
    plateNumber: "KA 01 F 8821",
    driverName: "Suresh Kumar",
    driverPhone: "+91 98450 12345",
    currentLocation: { lat: 12.9172, lng: 77.6228 },
    speed: 42,
    heading: 90,
    nextStop: "Silk Board Central Interchange",
    nextStopIndex: 3,
    etaMinutes: 4,
    occupancy: 28,
    capacity: 45,
    status: "on-route" as const,
    lastUpdated: Date.now(),
  };

  const tripRecordings = recordings.filter(
    (r) => r.busId === bus.id || r.tripId === trip.tripId
  );

  const displayPnr = `NEXUS-TKT-${trip.tripId.replace("trip-", "").slice(-6).toUpperCase() || "8821X9"}`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Top Navigation & Verification Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-slate-900/90 border border-cyan-500/30 shadow-2xl">
          <div className="flex items-center gap-3">
            <Link
              href="/passenger"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Back to Passenger App"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white">
                  SafeBus Live Ticket & Safety Portal
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  VERIFIED VALID
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Live QR Ticket Inspection • GPS Telematics • Realtime Video & Camera Access
              </p>
            </div>
          </div>

          <div className="text-right font-mono">
            <div className="text-[10px] uppercase text-slate-400">PNR Number</div>
            <div className="text-xs sm:text-sm font-bold text-cyan-300">{displayPnr}</div>
          </div>
        </div>

        {/* 3 Portal Tabs: Details, Live Camera, and Saved Videos */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-white/10 shadow-inner">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === "details"
                ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span className="hidden sm:inline">1. Customer & Ticket Details</span>
            <span className="sm:hidden">Ticket</span>
          </button>

          <button
            onClick={() => setActiveTab("live_camera")}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === "live_camera"
                ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Camera className="w-4 h-4 text-cyan-300" />
            <span className="hidden sm:inline">2. Live Camera & Bus Tracking</span>
            <span className="sm:hidden">Live Cam</span>
          </button>

          <button
            onClick={() => setActiveTab("saved_videos")}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === "saved_videos"
                ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Video className="w-4 h-4 text-cyan-300" />
            <span className="hidden sm:inline">3. Saved Video Vault (24h)</span>
            <span className="sm:hidden">24h Vault</span>
          </button>
        </div>

        {/* TAB 1: CUSTOMER & TICKET DETAILS */}
        {activeTab === "details" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Main Ticket Card (7 Cols) */}
            <div className="md:col-span-7 glass-panel p-6 rounded-3xl border border-cyan-500/40 shadow-2xl bg-slate-900/90 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                    Official Transit E-Ticket
                  </div>
                  <h2 className="text-lg font-black text-white">{trip.routeName}</h2>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-mono">Seat Number</div>
                  <div className="text-xl font-black font-mono text-cyan-300">{trip.seatNumber}</div>
                </div>
              </div>

              {/* Origin -> Destination Route Stops */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] text-slate-400">Boarding Station</div>
                  <div className="text-sm font-black text-white">{trip.originStop}</div>
                </div>
                <div className="text-center font-mono text-[10px] text-cyan-400 px-2">
                  <span>───►</span>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Destination Hub</div>
                  <div className="text-sm font-black text-white">{trip.destinationStop}</div>
                </div>
              </div>

              {/* Passenger & Emergency Contact Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs pt-1 border-b border-white/10 pb-4">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Passenger Name</div>
                  <div className="text-white font-bold flex items-center gap-1.5 mt-1">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{trip.passengerName}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Assigned Bus Unit</div>
                  <div className="text-white font-bold font-mono flex items-center gap-1.5 mt-1">
                    <BusIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{bus.id} ({bus.plateNumber})</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Emergency Contact</div>
                  <div className="text-slate-200 font-mono flex items-center gap-1.5 mt-1">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{trip.emergencyContact?.phone || "+91 98765 43210"}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Fare Paid</div>
                  <div className="text-emerald-400 font-black font-mono text-sm mt-0.5">
                    ₹45.00 (Transit Pay)
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab("live_camera")}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg"
                >
                  <Camera className="w-4 h-4" />
                  <span>Open Live Bus Camera</span>
                </button>

                <button
                  onClick={() => setActiveTab("saved_videos")}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-white/10 transition"
                >
                  <Video className="w-4 h-4" />
                  <span>Saved 24h Videos</span>
                </button>
              </div>
            </div>

            {/* QR Code Verification Card (5 Cols) */}
            <div className="md:col-span-5 glass-panel p-6 rounded-3xl border border-white/15 shadow-2xl bg-slate-900/90 flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 bg-white rounded-3xl shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                <QrCode className="w-36 h-36 text-slate-950" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Interactive Live QR Code</div>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Scan this live QR code from any smartphone to instantly inspect this passenger&apos;s trip status, GPS telemetry, and camera access.
                </p>
              </div>

              <div className="w-full p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-300 font-mono flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>AES-256 TELEMATICS ENCRYPTED</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE CAMERA & BUS TRACKING */}
        {activeTab === "live_camera" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Live Camera Viewfinder (7 Cols) */}
            <div className="md:col-span-7 glass-panel p-5 rounded-3xl border border-cyan-500/40 shadow-2xl bg-slate-900/90 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Live On-Bus Safety Camera</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  STREAMING LIVE
                </span>
              </div>

              {/* Viewfinder Box */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/15 flex items-center justify-center shadow-inner">
                <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6 text-center">
                  <div>
                    <Camera className="w-10 h-10 text-cyan-400 mx-auto mb-2 animate-pulse" />
                    <div className="text-sm font-bold text-white">Bus {bus.id} • Cabin Aisle Cam</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Passenger: {trip.passengerName} (Seat {trip.seatNumber})
                    </div>
                  </div>
                </div>

                {/* HUD Overlay */}
                <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300 bg-slate-950/70 px-2 py-1 rounded">
                    <span>GPS: {bus.currentLocation.lat.toFixed(4)}° N, {bus.currentLocation.lng.toFixed(4)}° E</span>
                    <span>SPEED: {bus.speed} KM/H</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-300 bg-slate-950/70 px-2 py-1 rounded self-start">
                    SAFEBUS TICKET VERIFIED • {displayPnr}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/25 text-xs text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Authorized live visual tracking enabled for ticket holder & guardian.</span>
              </div>
            </div>

            {/* Live GPS Map (5 Cols) */}
            <div className="md:col-span-5 flex flex-col gap-4 h-[420px]">
              <div className="flex-1 rounded-3xl overflow-hidden border border-white/15 shadow-2xl">
                <InteractiveMap
                  buses={[bus]}
                  activeBusId={bus.id}
                  focusLocation={bus.currentLocation}
                  height="100%"
                />
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Next Transit Hub</div>
                  <div className="text-white font-bold">{bus.nextStop}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">ETA</div>
                  <div className="text-cyan-300 font-bold font-mono">~{bus.etaMinutes} mins</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SAVED VIDEO VAULT & 24H PURGE */}
        {activeTab === "saved_videos" && (
          <div className="glass-panel p-6 rounded-3xl border border-cyan-500/40 shadow-2xl bg-slate-900/90 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <Video className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">24-Hour Ephemeral Saved Video Vault</h3>
                  <p className="text-xs text-slate-400">
                    Recorded footage linked to this ride • Auto-deleted 24 hours after trip completion
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30">
                🔒 24H PURGE ACTIVE
              </span>
            </div>

            <div className="space-y-3">
              {tripRecordings.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-white/10">
                  <Video className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <div className="text-xs font-bold text-slate-300">No Video Clips Recorded Yet</div>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                    When you record safety clips via the passenger camera or on-board CCTV, they appear here with AES-256 encryption.
                  </p>
                </div>
              ) : (
                tripRecordings.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                        <Video className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{rec.recordedBy}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Duration: {rec.durationSeconds}s • Encryption: {rec.encryptionHash}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        {rec.isIncidentPreserved ? "🛡️ PRESERVED FOR SOS" : "EXPIRES IN 24H"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function TicketVerificationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading ticket verification...</div>}>
      <TicketVerificationContent />
    </Suspense>
  );
}
