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
  Wifi,
} from "lucide-react";
import { getSyncEngine } from "@/lib/sync-engine";
import { useAuth } from "@/lib/auth-context";
import ThemeToggle from "@/components/common/ThemeToggle";

const NAV_LINKS = [
  { href: "/",         label: "Live Demo",    shortLabel: "Demo",   icon: Columns },
  { href: "/passenger",label: "Passenger",    shortLabel: "Ride",   icon: Smartphone },
  { href: "/operator", label: "Command",      shortLabel: "Ops",    icon: LayoutDashboard },
  { href: "/driver",   label: "Driver",       shortLabel: "Drive",  icon: Bus },
  { href: "/login",    label: "Portal",       shortLabel: "Login",  icon: LogIn },
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
    <header
      className="w-full sticky top-0 z-50"
      style={{
        background: "rgba(3, 5, 15, 0.75)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 1px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.05) inset",
      }}
    >
      {/* Top shimmer line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.6) 30%, rgba(34,211,238,0.5) 70%, transparent 100%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* ── Brand ── */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white relative overflow-hidden flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #22d3ee 60%, #a855f7 100%)",
              boxShadow: "0 0 20px rgba(99,102,241,0.5), 0 0 8px rgba(34,211,238,0.3)",
            }}
          >
            <Shield className="w-4.5 h-4.5 relative z-10" />
            {/* inner shine */}
            <div className="absolute inset-0 opacity-30"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 60%)" }} />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span
                className="text-base font-black tracking-tight"
                style={{
                  background: "linear-gradient(90deg, #e2e8f0, #22d3ee)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                SafeBus <span style={{ WebkitTextFillColor: "#22d3ee" }}>Nexus</span>
              </span>
              <span
                className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                style={{
                  background: "rgba(99,102,241,0.15)",
                  border: "1px solid rgba(99,102,241,0.35)",
                  color: "#a5b4fc",
                }}
              >
                v2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Where AI Protects Every Journey</p>
          </div>
        </Link>

        {/* ── Nav Pills ── */}
        <nav
          className="flex items-center gap-0.5 p-1 rounded-2xl flex-shrink-0"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}
        >
          {NAV_LINKS.map(({ href, label, shortLabel, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="relative px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-200"
                style={
                  active
                    ? {
                        background: "linear-gradient(135deg, rgba(99,102,241,0.8), rgba(34,211,238,0.6))",
                        color: "#fff",
                        boxShadow: "0 0 14px rgba(99,102,241,0.35), 0 2px 8px rgba(0,0,0,0.4)",
                      }
                    : {
                        color: "#94a3b8",
                      }
                }
              >
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? "text-white" : "text-slate-500"}`} />
                <span className="hidden lg:inline">{label}</span>
                <span className="lg:hidden">{shortLabel}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── Right Side ── */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* Live Status */}
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono"
            style={{
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
              color: "#34d399",
            }}
          >
            <Wifi className="w-3 h-3" />
            <span>Online</span>
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#34d399" }}
            />
          </div>

          {/* User / Sign In */}
          {user ? (
            <div
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <span className="text-sm leading-none">{user.avatar || "👤"}</span>
              <div className="hidden xl:block text-left">
                <p className="text-[11px] font-bold text-white leading-none truncate max-w-[100px]">{user.name}</p>
                <p className="text-[9px] font-mono capitalize" style={{ color: "#a5b4fc" }}>{user.role}</p>
              </div>
              <button
                onClick={() => logout()}
                title="Sign Out"
                className="text-slate-500 hover:text-red-400 p-1 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              style={{
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.3)",
                color: "#a5b4fc",
              }}
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Reset Demo */}
          <button
            onClick={handleResetDemo}
            title="Reset Demo Data"
            className="p-2 rounded-xl transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#64748b",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#e2e8f0";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
            }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
