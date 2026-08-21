"use client";

import React, { useState } from "react";
import { Trip } from "@/types";
import { Bus, QrCode, Shield, Sparkles, User, Phone, MapPin, CheckCircle2, ArrowRight } from "lucide-react";

interface PassengerCheckInProps {
  onStartTrip: (tripData: Omit<Trip, "tripId" | "startedAt" | "currentLocation">) => void;
}

export default function PassengerCheckIn({ onStartTrip }: PassengerCheckInProps) {
  const [passengerName, setPassengerName] = useState("Rahul Sharma");
  const [selectedRoute, setSelectedRoute] = useState("42A");
  const [seatNumber, setSeatNumber] = useState("14B");
  const [emergencyPhone, setEmergencyPhone] = useState("+91 98765 43210");
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanSuccess(true);
      setTimeout(() => {
        handleSubmit();
      }, 700);
    }, 1200);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const isRoute42 = selectedRoute === "42A";
    onStartTrip({
      passengerId: `pass-${Math.random().toString(36).substring(2, 8)}`,
      passengerName: passengerName.trim() || "Passenger",
      busId: isRoute42 ? "BUS-42A" : "BUS-18B",
      routeCode: selectedRoute,
      routeName: isRoute42 ? "Route 42A • Metro Tech Express" : "Route 18B • Airport Direct Link",
      originStop: isRoute42 ? "Electronic City Phase 1" : "Silk Board Interchange",
      destinationStop: isRoute42 ? "Majestic City Railway Hub" : "Indiranagar 100ft Road",
      seatNumber: seatNumber || "14B",
      status: "active",
      emergencyContact: {
        name: "Emergency Guardian",
        phone: emergencyPhone || "+91 98765 43210",
      },
    });
  };

  return (
    <div
      className="w-full max-w-lg mx-auto relative overflow-hidden rounded-3xl animate-slide-up"
      style={{
        background: "rgba(255,255,255,0.045)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.08) inset",
      }}
    >
      {/* Top shimmer */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.7), rgba(168,85,247,0.5), transparent)" }}
      />
      {/* Decorative orbs */}
      <div
        className="absolute -top-16 -left-16 w-44 h-44 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)", filter: "blur(20px)" }}
      />
      <div
        className="absolute -bottom-16 -right-16 w-44 h-44 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.10), transparent 70%)", filter: "blur(20px)" }}
      />

      <div className="p-6 relative z-10">
      {/* Header */}
      <div className="text-center mb-6 relative">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
          style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc" }}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>AI-Protected Smart Transit</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Board Your Safe Journey
        </h2>
        <p className="text-sm text-slate-300 mt-1">
          Instant QR check-in & 24/7 AI-supervised telemetry
        </p>
      </div>

      {/* One-Tap Simulated QR Boarding Card */}
      <div className="mb-6 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-cyan-500/30 rounded-2xl p-5 text-center shadow-lg relative group">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-cyan-950/70 border border-cyan-400/40 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
          {isScanning ? (
            <div className="relative flex items-center justify-center">
              <QrCode className="w-10 h-10 text-cyan-400 animate-pulse" />
              <div className="absolute inset-0 border-t-2 border-cyan-300 animate-bounce"></div>
            </div>
          ) : scanSuccess ? (
            <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-scale" />
          ) : (
            <QrCode className="w-10 h-10 text-cyan-300 group-hover:scale-110 transition-transform" />
          )}
        </div>

        <button
          type="button"
          onClick={handleSimulateScan}
          disabled={isScanning || scanSuccess}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all transform active:scale-98 flex items-center justify-center gap-2"
        >
          {isScanning ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Scanning Bus Smart Tag...</span>
            </>
          ) : scanSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Verified! Starting Journey...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Simulate Bus QR Check-In</span>
            </>
          )}
        </button>

        <div className="text-[11px] text-slate-400 mt-2">
          Or customize your trip details below
        </div>
      </div>

      {/* Manual Trip Customizer Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            Passenger Name
          </label>
          <input
            type="text"
            value={passengerName}
            onChange={(e) => setPassengerName(e.target.value)}
            required
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
            placeholder="e.g. Rahul Sharma"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Bus className="w-3.5 h-3.5 text-cyan-400" />
              Bus Route
            </label>
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
            >
              <option value="42A">Route 42A • Metro Express</option>
              <option value="18B">Route 18B • Airport Link</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              Seat Number
            </label>
            <input
              type="text"
              value={seatNumber}
              onChange={(e) => setSeatNumber(e.target.value)}
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
              placeholder="14B"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-cyan-400" />
            Emergency SOS Contact Phone
          </label>
          <input
            type="tel"
            value={emergencyPhone}
            onChange={(e) => setEmergencyPhone(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
            placeholder="+91 98765 43210"
          />
        </div>

        <button
          type="submit"
          className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.8), rgba(168,85,247,0.6))",
            border: "1px solid rgba(99,102,241,0.4)",
            color: "#fff",
            boxShadow: "0 0 20px rgba(99,102,241,0.3), 0 4px 14px rgba(0,0,0,0.4)",
          }}
        >
          <span>Start Trip Session</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
      </div>
    </div>
  );
}
