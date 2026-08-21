"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type AppTheme = "dark" | "light" | "cyber" | "daylight" | "midnight";

interface ThemeContextType {
  theme: "dark" | "light";
  isDark: boolean;
  setTheme: (theme: "dark" | "light") => void;
  toggleTheme: () => void;
}

const STORAGE_KEY_THEME = "safebus_theme_mode_v2";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyThemeToDocument(newTheme: "dark" | "light") {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", newTheme);
    if (newTheme === "light") {
      document.documentElement.classList.add("light-mode");
      document.documentElement.classList.remove("dark-mode");
    } else {
      document.documentElement.classList.add("dark-mode");
      document.documentElement.classList.remove("light-mode");
    }
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<"dark" | "light">("dark");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_THEME) as string | null;
      if (stored === "light" || stored === "daylight") {
        setThemeState("light");
        applyThemeToDocument("light");
      } else {
        setThemeState("dark");
        applyThemeToDocument("dark");
      }
    } catch {
      applyThemeToDocument("dark");
    }
  }, []);

  const setTheme = useCallback((newTheme: "dark" | "light") => {
    setThemeState(newTheme);
    applyThemeToDocument(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY_THEME, newTheme);
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next = current === "dark" ? "light" : "dark";
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
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === "dark",
        setTheme,
        toggleTheme,
      }}
    >
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
