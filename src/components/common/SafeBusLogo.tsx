"use client";

import React from "react";
import Image from "next/image";

interface SafeBusLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  showText?: boolean;
  subText?: string;
  badge?: string;
  animated?: boolean;
  className?: string;
}

const SIZE_MAP = {
  xs: { icon: 24, text: "text-sm", sub: "text-[10px]" },
  sm: { icon: 32, text: "text-base", sub: "text-[11px]" },
  md: { icon: 40, text: "text-lg", sub: "text-xs" },
  lg: { icon: 52, text: "text-xl", sub: "text-xs" },
  xl: { icon: 64, text: "text-2xl", sub: "text-sm" },
  "2xl": { icon: 88, text: "text-3xl", sub: "text-base" },
};

export default function SafeBusLogo({
  size = "md",
  showText = true,
  subText = "Public Transit Safety System",
  badge = "Enterprise",
  animated = false,
  className = "",
}: SafeBusLogoProps) {
  const { icon, text, sub } = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Icon Emblem */}
      <div
        className={`relative rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 ${
          animated ? "hover:scale-105" : ""
        }`}
        style={{ width: icon, height: icon }}
      >
        {/* Holographic Ambient Glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 opacity-70 blur-md -z-10 animate-pulse" />

        {/* Embedded SVG Icon */}
        <svg
          viewBox="0 0 512 512"
          fill="none"
          className="w-full h-full drop-shadow-[0_4px_12px_rgba(37,99,235,0.4)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`shieldGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#38bdf8" />
              <stop offset="50%" stop-color="#2563eb" />
              <stop offset="100%" stop-color="#1e1b4b" />
            </linearGradient>
            <linearGradient id={`busGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="50%" stop-color="#93c5fd" />
              <stop offset="100%" stop-color="#3b82f6" />
            </linearGradient>
            <linearGradient id={`glassGrad-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#67e8f9" />
              <stop offset="100%" stop-color="#0284c7" />
            </linearGradient>
          </defs>

          {/* Outer Shield Shell */}
          <path
            d="M256 46C150 78 80 120 80 230C80 345 180 435 256 470C332 435 432 345 432 230C432 120 362 78 256 46Z"
            fill="#0f172a"
            stroke={`url(#shieldGrad-${size})`}
            strokeWidth="14"
          />

          {/* Bus Chassis */}
          <rect x="156" y="150" width="200" height="210" rx="36" fill={`url(#busGrad-${size})`} />
          <rect
            x="176"
            y="168"
            width="160"
            height="74"
            rx="18"
            fill={`url(#glassGrad-${size})`}
            stroke="#38bdf8"
            strokeWidth="2.5"
          />
          <path d="M190 176 L230 176 L205 234 L180 234 Z" fill="#ffffff" fillOpacity="0.4" />

          {/* LED Destination Matrix */}
          <rect x="196" y="154" width="120" height="10" rx="4" fill="#090d16" stroke="#38bdf8" strokeWidth="1" />
          <circle cx="210" cy="159" r="2.5" fill="#38bdf8" />
          <circle cx="220" cy="159" r="2.5" fill="#38bdf8" />
          <circle cx="230" cy="159" r="2.5" fill="#38bdf8" />
          <circle cx="280" cy="159" r="2.5" fill="#22c55e" />
          <circle cx="290" cy="159" r="2.5" fill="#22c55e" />
          <circle cx="300" cy="159" r="2.5" fill="#22c55e" />

          {/* Windows */}
          <rect x="176" y="254" width="34" height="42" rx="8" fill="#0f172a" stroke="#60a5fa" strokeWidth="2" />
          <rect x="218" y="254" width="34" height="42" rx="8" fill="#0f172a" stroke="#60a5fa" strokeWidth="2" />
          <rect x="260" y="254" width="34" height="42" rx="8" fill="#0f172a" stroke="#60a5fa" strokeWidth="2" />
          <rect x="302" y="254" width="34" height="42" rx="8" fill="#0f172a" stroke="#60a5fa" strokeWidth="2" />

          {/* Headlights */}
          <rect x="168" y="316" width="36" height="14" rx="6" fill="#38bdf8" />
          <rect x="308" y="316" width="36" height="14" rx="6" fill="#38bdf8" />

          {/* Central Core Guard Star */}
          <g transform="translate(256, 395)">
            <circle cx="0" cy="0" r="26" fill="#090d16" stroke="#38bdf8" strokeWidth="3" />
            <path
              d="M0 -11 L2.5 -2.5 L11 0 L2.5 2.5 L0 11 L-2.5 2.5 L-11 0 L-2.5 -2.5 Z"
              fill="#ffffff"
            />
          </g>
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className={`${text} font-black text-white tracking-tight leading-none`}>
              SafeBus <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">Nexus</span>
            </span>
            {badge && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800/80 uppercase tracking-wider font-mono">
                {badge}
              </span>
            )}
          </div>
          {subText && (
            <p className={`${sub} text-slate-400 font-medium tracking-normal mt-0.5`}>
              {subText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
