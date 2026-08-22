"use client";

import React, { useState, useEffect } from "react";
import SafeBusLogo from "./SafeBusLogo";
import { getSoundEngine } from "@/lib/audio-effects";
import {
  ShieldCheck,
  Radio,
  Cpu,
  Sparkles,
  CheckCircle2,
  Lock,
  ChevronRight,
} from "lucide-react";

const BOOT_STEPS = [
  { text: "Connecting to Global Fleet GPS Satellites...", icon: Radio, pct: 25 },
  { text: "Arming 12-Hour Zero-Knowledge Video Encryption Vault...", icon: Lock, pct: 50 },
  { text: "Syncing Real-Time Driver Cockpit & Multi-Camera Feeds...", icon: Cpu, pct: 75 },
  { text: "Warming Gemini AI Route & Safety Co-Pilot Engine...", icon: Sparkles, pct: 92 },
  { text: "SafeBus Nexus Enterprise Security Network Online", icon: CheckCircle2, pct: 100 },
];

export default function AppLoadingScreen() {
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    // Check if user already booted during this browser session
    const hasBooted = sessionStorage.getItem("safebus_nexus_booted");
    if (hasBooted) {
      setIsVisible(false);
      setHasLoaded(true);
      return;
    }

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 8) + 4;
      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(100);
        setStepIndex(BOOT_STEPS.length - 1);
        clearInterval(interval);

        try {
          getSoundEngine().playSuccess();
        } catch (e) {}

        sessionStorage.setItem("safebus_nexus_booted", "true");

        setTimeout(() => {
          setIsVisible(false);
          setHasLoaded(true);
        }, 600);
      } else {
        setProgress(currentProgress);
        if (currentProgress < 30) setStepIndex(0);
        else if (currentProgress < 55) setStepIndex(1);
        else if (currentProgress < 80) setStepIndex(2);
        else if (currentProgress < 95) setStepIndex(3);
        else setStepIndex(4);
      }
    }, 90);

    return () => clearInterval(interval);
  }, []);

  const handleSkip = () => {
    sessionStorage.setItem("safebus_nexus_booted", "true");
    setIsVisible(false);
    setHasLoaded(true);
  };

  if (!isVisible) return null;

  const CurrentIcon = BOOT_STEPS[stepIndex]?.icon || ShieldCheck;

  return (
    <div className="fixed inset-0 z-[999999] bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 select-none overflow-hidden animate-in fade-in duration-300">
      {/* Background Cybernetic Grid & Radar Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e40af_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-600/20 via-cyan-500/15 to-transparent blur-3xl -z-10 animate-pulse pointer-events-none" />

      {/* Orbiting Radar Pulse Circles */}
      <div className="absolute w-80 h-80 rounded-full border border-blue-500/20 animate-ping duration-1000 -z-10 pointer-events-none" />
      <div className="absolute w-[440px] h-[440px] rounded-full border border-cyan-500/15 -z-10 pointer-events-none" />

      <div className="max-w-md w-full flex flex-col items-center text-center relative z-10 space-y-6">
        {/* Hero Logo Emblem */}
        <div className="relative transform transition-transform hover:scale-105 duration-300">
          <SafeBusLogo
            size="2xl"
            showText={false}
            animated={true}
          />
        </div>

        {/* Brand Name & Tagline */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span>SafeBus</span>
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
              Nexus
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            AI-Powered Smart Public Transit Safety Platform
          </p>
        </div>

        {/* Futuristic Status Message Card */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm space-y-3">
          {/* Active Boot Step */}
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-cyan-400 border border-blue-500/30 flex items-center justify-center shrink-0 animate-spin-slow">
              <CurrentIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                System Initialization
              </div>
              <div className="text-xs font-semibold text-white truncate">
                {BOOT_STEPS[stepIndex]?.text}
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-blue-400">
              {progress}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-500 h-full rounded-full transition-all duration-150 shadow-[0_0_12px_rgba(34,211,238,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Security Protocols Indicator Tags */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
            <span>TLS 1.3 • AES-256</span>
            <span>12H PRIVACY VAULT</span>
            <span>GEMINI 2.0 FLASH</span>
          </div>
        </div>

        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold transition px-3 py-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800"
        >
          <span>Enter Dashboard Immediately</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Footer Telemetry */}
      <div className="absolute bottom-4 text-[10px] font-mono text-slate-600 text-center">
        SafeBus Nexus • ISO/IEC 27001 Certified • Real-Time Fleet Safety OS
      </div>
    </div>
  );
}
