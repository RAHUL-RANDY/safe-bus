"use client";

import React from "react";
import { useTheme } from "@/lib/theme-context";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center h-8 w-16 px-1 rounded-full transition-colors duration-300 focus:outline-none border shadow-inner ${
        isDark
          ? "bg-slate-900 border-slate-700 hover:border-blue-500/50"
          : "bg-slate-200 border-slate-300 hover:border-blue-500/50"
      }`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle Theme"
    >
      {/* Sliding Knob */}
      <span
        className={`inline-flex items-center justify-center w-6 h-6 rounded-full transform transition-transform duration-300 shadow-md ${
          isDark
            ? "translate-x-8 bg-blue-600 text-white"
            : "translate-x-0 bg-white text-amber-500"
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5" />
        ) : (
          <Sun className="w-3.5 h-3.5" />
        )}
      </span>

      {/* Static Icons behind */}
      <span className="absolute left-2 text-[10px] text-amber-500 pointer-events-none select-none">
        {!isDark ? "" : "☀️"}
      </span>
      <span className="absolute right-2 text-[10px] text-blue-400 pointer-events-none select-none">
        {isDark ? "" : "🌙"}
      </span>
    </button>
  );
}
