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
import SafeBusLogo from "@/components/common/SafeBusLogo";

const NAV_LINKS = [
  { href: "/passenger", label: "Passenger Hub", shortLabel: "Passenger", icon: Smartphone },
  { href: "/ticket", label: "Digital Ticket", shortLabel: "Ticket", icon: Ticket },
  { href: "/driver", label: "Driver Cockpit", shortLabel: "Driver", icon: Bus },
  { href: "/operator", label: "Fleet Command", shortLabel: "Command", icon: LayoutDashboard },
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
        <Link href="/passenger" className="flex items-center group flex-shrink-0">
          <SafeBusLogo size="sm" animated={true} />
        </Link>

        {/* Navigation Tabs (Desktop only - Mobile uses bottom nav) */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-slate-950/70 border border-slate-800">
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
                <span>{label}</span>
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
