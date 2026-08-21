"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme, AppTheme } from "@/lib/theme-context";
import {
  Sun,
  Moon,
  Sparkles,
  Terminal,
  Palette,
  Check,
  ChevronDown,
} from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themes: { id: AppTheme; label: string; icon: React.ReactNode; color: string; desc: string }[] = [
    {
      id: "cyber",
      label: "Cyber Neon",
      icon: <Sparkles className="w-3.5 h-3.5 text-cyan-400" />,
      color: "bg-cyan-500/20 border-cyan-400/40 text-cyan-300",
      desc: "Deep space obsidian & neon",
    },
    {
      id: "daylight",
      label: "Daylight Mode",
      icon: <Sun className="w-3.5 h-3.5 text-amber-400" />,
      color: "bg-amber-500/20 border-amber-400/40 text-amber-300",
      desc: "High-contrast clean sunlight",
    },
    {
      id: "matrix",
      label: "Matrix Terminal",
      icon: <Terminal className="w-3.5 h-3.5 text-emerald-400" />,
      color: "bg-emerald-500/20 border-emerald-400/40 text-emerald-300",
      desc: "Cybernetic emerald telemetry",
    },
    {
      id: "midnight",
      label: "Midnight OLED",
      icon: <Moon className="w-3.5 h-3.5 text-indigo-400" />,
      color: "bg-indigo-500/20 border-indigo-400/40 text-indigo-300",
      desc: "Pure #000000 AMOLED saver",
    },
  ];

  const currentThemeObj = themes.find((t) => t.id === theme) || themes[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
        title="Toggle Application Theme"
      >
        {currentThemeObj.icon}
        <span className="hidden sm:inline text-slate-200">{currentThemeObj.label}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900/95 border border-cyan-500/30 p-2 shadow-2xl backdrop-blur-2xl z-50 animate-fade-in flex flex-col gap-1">
          <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5 border-b border-white/10 mb-1">
            <Palette className="w-3 h-3 text-cyan-400" />
            <span>Select UI Aesthetic</span>
          </div>

          {themes.map((t) => {
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                className={`w-full p-2 rounded-xl text-left text-xs transition flex items-center justify-between ${
                  isSelected
                    ? `${t.color} border font-bold shadow-sm`
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  {t.icon}
                  <div>
                    <div className="font-semibold text-xs leading-tight">{t.label}</div>
                    <div className="text-[10px] text-slate-400 leading-none mt-0.5">{t.desc}</div>
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
