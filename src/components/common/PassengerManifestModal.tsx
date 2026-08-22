"use client";

import React, { useState, useEffect } from "react";
import { Trip, Bus, Alert } from "@/types";
import { getSyncEngine } from "@/lib/sync-engine";
import { getSoundEngine } from "@/lib/audio-effects";
import { useToast } from "@/lib/toast-context";
import {
  Users,
  Search,
  X,
  Phone,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Clock,
  Ticket,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter,
  CreditCard,
  Bus as BusIcon,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface PassengerManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetBusId?: string; // Optional: filter for specific bus if opened from Driver cockpit
  buses?: Bus[];
}

export default function PassengerManifestModal({
  isOpen,
  onClose,
  targetBusId,
  buses = [],
}: PassengerManifestModalProps) {
  const { toast } = useToast();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBus, setFilterBus] = useState<string>(targetBusId || "ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "active" | "emergency">("ALL");
  const [selectedPassenger, setSelectedPassenger] = useState<Trip | null>(null);

  useEffect(() => {
    if (targetBusId) {
      setFilterBus(targetBusId);
    }
  }, [targetBusId]);

  useEffect(() => {
    const engine = getSyncEngine();
    const unsubTrips = engine.subscribeTrips((t) => setTrips(t));
    const unsubAlerts = engine.subscribeAlerts((a) => setAlerts(a));

    return () => {
      unsubTrips();
      unsubAlerts();
    };
  }, []);

  if (!isOpen) return null;

  // Filter trips
  const filteredTrips = trips.filter((trip) => {
    // Bus filter
    if (filterBus !== "ALL" && trip.busId !== filterBus) return false;

    // Emergency filter
    const hasEmergency = alerts.some(
      (a) => a.tripId === trip.tripId && (a.status === "open" || a.status === "acknowledged")
    );
    if (filterStatus === "emergency" && !hasEmergency) return false;
    if (filterStatus === "active" && trip.status !== "active") return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = trip.passengerName.toLowerCase().includes(q);
      const matchSeat = trip.seatNumber.toLowerCase().includes(q);
      const matchId = trip.tripId.toLowerCase().includes(q);
      const matchOrigin = trip.originStop.toLowerCase().includes(q);
      const matchDest = trip.destinationStop.toLowerCase().includes(q);
      const matchPhone = trip.emergencyContact.phone.includes(q);
      return matchName || matchSeat || matchId || matchOrigin || matchDest || matchPhone;
    }

    return true;
  });

  const handleCallEmergencyContact = (passenger: Trip) => {
    getSoundEngine().playClick();
    toast({
      title: `📞 Dispatching Call to Guardian`,
      description: `Dialing ${passenger.emergencyContact.name} (${passenger.emergencyContact.phone}) for passenger ${passenger.passengerName}.`,
      type: "info",
    });
    if (typeof window !== "undefined") {
      window.open(`tel:${passenger.emergencyContact.phone.replace(/\s+/g, "")}`);
    }
  };

  const handlePrintManifest = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Live Passenger Manifest & Safety Roster
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  REAL-TIME SYNC
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Authorized for Driver Cockpit & Fleet Command Center surveillance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintManifest}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
              title="Print Passenger Roster"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Manifest</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Search Filters */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by passenger name, seat (e.g. 14B), route, or stop..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9.5 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Bus Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Vehicle:</span>
            <select
              value={filterBus}
              onChange={(e) => setFilterBus(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition font-mono"
            >
              <option value="ALL">All Fleet Vehicles</option>
              <option value="BUS-42A">BUS-42A (Route 42A)</option>
              <option value="BUS-18B">BUS-18B (Route 18B)</option>
              <option value="BUS-09C">BUS-09C (Route 09C)</option>
            </select>
          </div>

          {/* Status Quick Filter Chips */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === "ALL"
                  ? "bg-blue-600 text-white font-bold"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              All ({trips.length})
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === "active"
                  ? "bg-emerald-600 text-white font-bold"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              On Board ({trips.filter((t) => t.status === "active").length})
            </button>
            <button
              onClick={() => setFilterStatus("emergency")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === "emergency"
                  ? "bg-red-600 text-white font-bold"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              SOS Alerts ({alerts.filter((a) => a.status === "open").length})
            </button>
          </div>
        </div>

        {/* Manifest Table Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          {filteredTrips.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <Users className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-sm font-bold text-white">No Passengers Found</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No active passengers match the selected filter criteria. As passengers check in or book tickets online, their details appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredTrips.map((passenger) => {
                const isEmergency = alerts.some(
                  (a) =>
                    a.tripId === passenger.tripId &&
                    (a.status === "open" || a.status === "acknowledged")
                );

                return (
                  <div
                    key={passenger.tripId}
                    className={`p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between gap-3 shadow-md ${
                      isEmergency
                        ? "bg-red-950/40 border-red-500/60 shadow-red-950/40"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {/* Top Row: Name, Seat, Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-base font-bold text-white shrink-0">
                          {passenger.passengerName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white">
                              {passenger.passengerName}
                            </h3>
                            {isEmergency ? (
                              <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-400 font-mono text-[9px] font-bold border border-red-800 flex items-center gap-1 animate-pulse">
                                <ShieldAlert className="w-3 h-3 text-red-400" />
                                SOS ACTIVE
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-mono text-[9px] font-bold border border-emerald-800 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                ON BOARD
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 font-mono">
                            Seat <b className="text-blue-400">{passenger.seatNumber}</b> • Bus{" "}
                            <b className="text-white">{passenger.busId}</b>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-400 block">Ticket Ref</span>
                        <span className="text-[11px] font-mono font-bold text-slate-200">
                          {passenger.tripId.slice(0, 14)}
                        </span>
                      </div>
                    </div>

                    {/* Route & Corridor Corridor Stops */}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="truncate">
                          <b>From:</b> {passenger.originStop}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">
                          <b>To:</b> {passenger.destinationStop}
                        </span>
                      </div>
                    </div>

                    {/* Footer Row: Emergency Contact & Quick Action */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-slate-400">Emergency Guardian:</div>
                        <div className="text-xs font-semibold text-slate-200">
                          {passenger.emergencyContact.name} ({passenger.emergencyContact.phone})
                        </div>
                      </div>

                      <button
                        onClick={() => handleCallEmergencyContact(passenger)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-bold border border-blue-500/40 flex items-center gap-1.5 transition"
                        title="Call Passenger Emergency Contact"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Summary Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div>
            Showing <b className="text-white">{filteredTrips.length}</b> on-board passengers across{" "}
            <b className="text-white">{filterBus === "ALL" ? "All Fleet Vehicles" : filterBus}</b>
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            SafeBus Nexus Telemetry Protocol • Encryption: AES-256
          </div>
        </div>
      </div>
    </div>
  );
}
