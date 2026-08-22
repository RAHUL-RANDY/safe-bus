"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Smartphone,
  Ticket,
  Bus,
  LayoutDashboard,
  LogIn,
  User,
  Shield,
} from "lucide-react";
import { getSoundEngine } from "@/lib/audio-effects";
import { useAuth } from "@/lib/auth-context";

const MOBILE_NAV_ITEMS = [
  {
    href: "/passenger",
    label: "Passenger",
    icon: Smartphone,
    color: "text-blue-400",
    activeBg: "bg-blue-600",
  },
  {
    href: "/ticket",
    label: "Tickets",
    icon: Ticket,
    color: "text-emerald-400",
    activeBg: "bg-emerald-600",
  },
  {
    href: "/driver",
    label: "Driver",
    icon: Bus,
    color: "text-amber-400",
    activeBg: "bg-amber-600",
  },
  {
    href: "/operator",
    label: "Command",
    icon: LayoutDashboard,
    color: "text-indigo-400",
    activeBg: "bg-indigo-600",
  },
  {
    href: "/login",
    label: "Portal",
    icon: LogIn,
    color: "text-purple-400",
    activeBg: "bg-purple-600",
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const handleTabClick = () => {
    getSoundEngine().playClick();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 shadow-[0_-10px_30px_rgba(0,0,0,0.6)]">
      <nav className="flex items-center justify-around max-w-md mx-auto">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleTabClick}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 min-w-[58px] min-h-[50px] relative ${
                isActive
                  ? "text-white scale-105"
                  : "text-slate-400 hover:text-slate-200 active:scale-95"
              }`}
            >
              {/* Active Ambient Glow Background */}
              {isActive && (
                <div className="absolute inset-0 rounded-2xl bg-blue-600/15 border border-blue-500/30 -z-10 shadow-[0_0_15px_rgba(37,99,235,0.25)] animate-in fade-in zoom-in-95 duration-200" />
              )}

              <div
                className={`p-1 rounded-xl transition-transform ${
                  isActive ? "text-blue-400 transform -translate-y-0.5" : ""
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <span
                className={`text-[10px] font-semibold tracking-tight transition-colors ${
                  isActive ? "text-white font-bold" : "text-slate-400"
                }`}
              >
                {item.label}
              </span>

              {/* Active Indicator Dot */}
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-blue-400 mt-0.5 shadow-[0_0_6px_#60a5fa]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
