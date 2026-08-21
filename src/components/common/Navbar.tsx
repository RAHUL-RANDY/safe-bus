"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Bus,
  LayoutDashboard,
  Smartphone,
  Columns,
  RotateCcw,
  LogIn,
  LogOut,
  User,
  Ticket,
  Activity,
} from "lucide-react";
import { getSyncEngine } from "@/lib/sync-engine";
import { useAuth } from "@/lib/auth-context";
import ThemeToggle from "@/components/common/ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "Overview", shortLabel: "Home", icon: Columns },
  { href: "/passenger", label: "Passenger Hub", shortLabel: "Passenger", icon: Smartphone },
  { href: "/operator", label: "Fleet Command", shortLabel: "Command", icon: LayoutDashboard },
  { href: "/driver", label: "Driver Cockpit", shortLabel: "Driver", icon: Bus },
  { href: "/ticket", label: "Digital Ticket", shortLabel: "Ticket", icon: Ticket },
  { href: "/login", label: "Portal", shortLabel: "Login", icon: LogIn },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleResetDemo = () => {
    if (confirm("Reset all live demo trips, SOS alerts, and telemetry?")) {
      getSyncEngine().resetDemoData();
    }
  };

  return (
    <header className="w-full sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">
                SafeBus <span className="text-blue-400">Nexus</span>
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Public Transit Safety System</p>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/70 border border-slate-800">
          {NAV_LINKS.map(({ href, label, shortLabel, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  active
                    ? "bg-blue-600 text-white shadow-sm font-bold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? "text-white" : "text-slate-400"}`} />
                <span className="hidden md:inline">{label}</span>
                <span className="md:hidden">{shortLabel}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Status Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Live Telemetry</span>
          </div>

          {/* User Sign In / Profile */}
          {user ? (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700">
              <span className="text-sm">{user.avatar || "👤"}</span>
              <div className="hidden xl:block text-left">
                <p className="text-[11px] font-bold text-white leading-none truncate max-w-[100px]">{user.name}</p>
                <p className="text-[9px] text-blue-400 font-mono capitalize">{user.role}</p>
              </div>
              <button
                onClick={() => logout()}
                title="Sign Out"
                className="text-slate-400 hover:text-red-400 p-1 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
            >
              Sign In
            </Link>
          )}

          <ThemeToggle />

          <button
            onClick={handleResetDemo}
            title="Reset Simulation Data"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
