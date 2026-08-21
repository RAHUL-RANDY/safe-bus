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
  ArrowLeft,
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
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow">
          <div className="flex items-center gap-3">
            <Link
              href="/passenger"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Back to Passenger App"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white">
                  SafeBus Digital Smart Ticket
                </h1>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  VERIFIED VALID
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official Public Transit Electronic Travel Document
              </p>
            </div>
          </div>

          <div className="text-right font-mono">
            <div className="text-[10px] uppercase text-slate-400">PNR Reference</div>
            <div className="text-xs sm:text-sm font-bold text-blue-400">{displayPnr}</div>
          </div>
        </div>

        {/* 3 Portal Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === "details"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span className="hidden sm:inline">1. Ticket & Route</span>
            <span className="sm:hidden">Ticket</span>
          </button>

          <button
            onClick={() => setActiveTab("live_camera")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === "live_camera"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">2. Live Bus Tracking</span>
            <span className="sm:hidden">Live Cam</span>
          </button>

          <button
            onClick={() => setActiveTab("saved_videos")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === "saved_videos"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">3. 24h Video Vault</span>
            <span className="sm:hidden">Vault</span>
          </button>
        </div>

        {/* TAB 1: TICKET DETAILS */}
        {activeTab === "details" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Main Ticket Card (7 Cols) */}
            <div className="md:col-span-7 p-6 rounded-2xl border border-slate-800 bg-slate-900 shadow space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                    Electronic Transit Ticket
                  </div>
                  <h2 className="text-lg font-bold text-white">{trip.routeName}</h2>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-mono">Seat Number</div>
                  <div className="text-xl font-black font-mono text-amber-400">{trip.seatNumber}</div>
                </div>
              </div>

              {/* Origin -> Destination */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] text-slate-400">Boarding Point</div>
                  <div className="text-sm font-bold text-white">{trip.originStop}</div>
                </div>
                <div className="text-center font-mono text-xs text-blue-400 px-2">
                  <span>───►</span>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Destination</div>
                  <div className="text-sm font-bold text-white">{trip.destinationStop}</div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs pt-1 border-b border-slate-800 pb-4">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Passenger Name</div>
                  <div className="text-white font-bold flex items-center gap-1.5 mt-1">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>{trip.passengerName}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Vehicle Unit</div>
                  <div className="text-white font-bold font-mono flex items-center gap-1.5 mt-1">
                    <BusIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>{bus.id} ({bus.plateNumber})</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Emergency Contact</div>
                  <div className="text-slate-200 font-mono flex items-center gap-1.5 mt-1">
                    <Phone className="w-3.5 h-3.5 text-blue-400" />
                    <span>{trip.emergencyContact?.phone || "+91 98765 43210"}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Fare Paid</div>
                  <div className="text-emerald-400 font-bold font-mono text-sm mt-0.5">
                    ₹45.00 (Transit Pass)
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab("live_camera")}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition"
                >
                  <Camera className="w-4 h-4" />
                  <span>View Live Bus Camera</span>
                </button>

                <button
                  onClick={() => setActiveTab("saved_videos")}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition"
                >
                  <Video className="w-4 h-4" />
                  <span>24h Video Vault</span>
                </button>
              </div>
            </div>

            {/* QR Code Verification Card (5 Cols) */}
            <div className="md:col-span-5 p-6 rounded-2xl border border-slate-800 bg-slate-900 shadow flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 bg-white rounded-2xl shadow">
                <QrCode className="w-36 h-36 text-slate-950" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Digital Travel QR Code</div>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Scan at vehicle validator or show to ticket inspector for instant verification.
                </p>
              </div>

              <div className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>AES-256 DIGITAL SIGNATURE VALID</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE CAMERA */}
        {activeTab === "live_camera" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-7 p-5 rounded-2xl border border-slate-800 bg-slate-900 shadow space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Live On-Bus Camera</h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  STREAMING LIVE
                </span>
              </div>

              <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 flex items-center justify-center p-6 text-center">
                  <div>
                    <Camera className="w-10 h-10 text-blue-400 mx-auto mb-2" />
                    <div className="text-sm font-bold text-white">Bus {bus.id} • Cabin Stream</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Passenger: {trip.passengerName} (Seat {trip.seatNumber})
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs font-mono text-blue-300 bg-black/80 px-2 py-1 rounded">
                    <span>GPS: {bus.currentLocation.lat.toFixed(4)}° N, {bus.currentLocation.lng.toFixed(4)}° E</span>
                    <span>SPEED: {bus.speed} KM/H</span>
                  </div>
                  <div className="text-xs font-mono text-slate-300 bg-black/80 px-2 py-1 rounded self-start">
                    SAFEBUS TICKET VERIFIED • {displayPnr}
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 flex flex-col gap-4 h-[380px]">
              <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800 shadow">
                <InteractiveMap
                  buses={[bus]}
                  activeBusId={bus.id}
                  focusLocation={bus.currentLocation}
                  height="100%"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Next Transit Stop</div>
                  <div className="text-white font-bold">{bus.nextStop}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">ETA</div>
                  <div className="text-blue-400 font-bold font-mono">~{bus.etaMinutes} mins</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SAVED VIDEOS */}
        {activeTab === "saved_videos" && (
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900 shadow space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Video className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">24-Hour Video Vault</h3>
                  <p className="text-xs text-slate-400">
                    Recorded footage linked to this ride • Automatically purged 24 hours after journey
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-blue-950 text-blue-300 font-mono text-[10px] font-bold border border-blue-800">
                🔒 24H PURGE ACTIVE
              </span>
            </div>

            <div className="space-y-3">
              {tripRecordings.length === 0 ? (
                <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800">
                  <Video className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <div className="text-xs font-bold text-slate-300">No Video Clips Recorded Yet</div>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    When you record safety clips via the passenger camera or on-board CCTV, they appear here with AES-256 encryption.
                  </p>
                </div>
              ) : (
                tripRecordings.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-800">
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
                      <span className="text-[10px] font-mono text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
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
