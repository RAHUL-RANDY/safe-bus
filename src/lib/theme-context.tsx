"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type AppTheme = "cyber" | "daylight" | "matrix" | "midnight";

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY_THEME = "safebus_theme_v1";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyThemeToDocument(newTheme: AppTheme) {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", newTheme);
    if (newTheme === "daylight") {
      document.documentElement.classList.add("light-mode");
    } else {
      document.documentElement.classList.remove("light-mode");
    }
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>("cyber");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_THEME) as AppTheme | null;
      if (stored && ["cyber", "daylight", "matrix", "midnight"].includes(stored)) {
        setThemeState(stored);
        applyThemeToDocument(stored);
      } else {
        applyThemeToDocument("cyber");
      }
    } catch {
      applyThemeToDocument("cyber");
    }
  }, []);

  const setTheme = useCallback((newTheme: AppTheme) => {
    setThemeState(newTheme);
    applyThemeToDocument(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY_THEME, newTheme);
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const sequence: AppTheme[] = ["cyber", "daylight", "matrix", "midnight"];
    setThemeState((current) => {
      const nextIdx = (sequence.indexOf(current) + 1) % sequence.length;
      const next = sequence[nextIdx];
      applyThemeToDocument(next);
      try {
        localStorage.setItem(STORAGE_KEY_THEME, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
