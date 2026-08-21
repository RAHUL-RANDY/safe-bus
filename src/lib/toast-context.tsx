"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, ShieldAlert, X } from "lucide-react";
import { getSoundEngine } from "./audio-effects";

export type ToastType = "success" | "info" | "warning" | "emergency";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (options: {
    title: string;
    description?: string;
    type?: ToastType;
    duration?: number;
  }) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({
      title,
      description,
      type = "info",
      duration = 4000,
    }: {
      title: string;
      description?: string;
      type?: ToastType;
      duration?: number;
    }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastMessage = {
        id,
        title,
        description,
        type,
        duration,
      };

      // Sound trigger based on toast type
      const sounds = getSoundEngine();
      if (type === "success") sounds.playSuccess();
      else if (type === "emergency") sounds.playEmergency();
      else if (type === "info") sounds.playClick();

      setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ toast, dismissToast }}>
      {children}

      {/* Floating Toast Portal */}
      <div className="fixed bottom-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2 sm:p-0">
        {toasts.map((t) => {
          const isSuccess = t.type === "success";
          const isEmergency = t.type === "emergency";
          const isWarning = t.type === "warning";

          return (
            <div
              key={t.id}
              className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl flex items-start gap-3 transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-bottom-5 backdrop-blur-xl ${
                isEmergency
                  ? "bg-red-950/95 border-red-600 text-white shadow-red-900/40"
                  : isSuccess
                  ? "bg-slate-900/95 border-emerald-500/50 text-white shadow-emerald-950/30"
                  : isWarning
                  ? "bg-slate-900/95 border-amber-500/50 text-white shadow-amber-950/30"
                  : "bg-slate-900/95 border-blue-500/40 text-white shadow-slate-950/40"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isEmergency && <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />}
                {isWarning && <AlertCircle className="w-5 h-5 text-amber-400" />}
                {t.type === "info" && <Info className="w-5 h-5 text-blue-400" />}
              </div>

              <div className="flex-1 space-y-0.5">
                <div className="text-xs font-bold leading-tight">{t.title}</div>
                {t.description && (
                  <p className="text-[11px] text-slate-300 leading-normal">{t.description}</p>
                )}
              </div>

              <button
                onClick={() => dismissToast(t.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
