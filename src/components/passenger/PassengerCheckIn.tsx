"use client";

import React, { useState } from "react";
import { Trip } from "@/types";
import { Bus, QrCode, Shield, User, Phone, MapPin, CheckCircle2, ArrowRight } from "lucide-react";

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
      }, 600);
    }, 1000);
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
    <div className="w-full max-w-lg mx-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-xl p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950 border border-blue-800 text-blue-300 text-xs font-semibold mb-2">
          <Shield className="w-3.5 h-3.5" />
          <span>Smart Passenger Boarding</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Board Your Bus
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Scan QR tag at bus door or enter seat details to begin live journey
        </p>
      </div>

      {/* QR Simulation Card */}
      <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-center flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
          {isScanning ? (
            <QrCode className="w-8 h-8 text-blue-400 animate-pulse" />
          ) : scanSuccess ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          ) : (
            <QrCode className="w-8 h-8 text-blue-400" />
          )}
        </div>

        <button
          type="button"
          onClick={handleSimulateScan}
          disabled={isScanning || scanSuccess}
          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition"
        >
          {isScanning ? (
            <span>Verifying Bus Tag...</span>
          ) : scanSuccess ? (
            <span>Verified! Loading Trip...</span>
          ) : (
            <span>1-Click Scan Bus QR Code</span>
          )}
        </button>
      </div>

      {/* Manual Details Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
            Passenger Name
          </label>
          <input
            type="text"
            value={passengerName}
            onChange={(e) => setPassengerName(e.target.value)}
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            placeholder="e.g. Rahul Sharma"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Select Bus Route
            </label>
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
            >
              <option value="42A">Route 42A • Metro Express</option>
              <option value="18B">Route 18B • Airport Direct</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Seat Number
            </label>
            <input
              type="text"
              value={seatNumber}
              onChange={(e) => setSeatNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              placeholder="14B"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
            Emergency SOS Contact Phone
          </label>
          <input
            type="tel"
            value={emergencyPhone}
            onChange={(e) => setEmergencyPhone(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            placeholder="+91 98765 43210"
          />
        </div>

        <button
          type="submit"
          className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow transition flex items-center justify-center gap-2"
        >
          <span>Start Journey</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
