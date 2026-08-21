"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Smartphone,
  LayoutDashboard,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Bus,
  Radio,
  BadgeCheck,
} from "lucide-react";
import { useAuth, DEMO_USERS } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, signUp, quickDemoLogin, user } = useAuth();

  const [activeTab, setActiveTab] = useState<"passenger" | "operator">("passenger");
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email || !password) {
      setErrorMsg("Please provide both email and password.");
      return;
    }

    if (isSignUp && !fullName) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    setIsSubmitting(true);

    if (isSignUp) {
      const res = await signUp(email, password, fullName, activeTab);
      setIsSubmitting(false);
      if (res.success) {
        setSuccessMsg("Account created successfully! Redirecting...");
        setTimeout(() => {
          router.push(activeTab === "operator" ? "/operator" : "/passenger");
        }, 1200);
      } else {
        setErrorMsg(res.error || "Failed to create account.");
      }
    } else {
      const res = await login(email, password, activeTab);
      setIsSubmitting(false);
      if (res.success) {
        setSuccessMsg("Authentication verified. Loading workspace...");
        setTimeout(() => {
          router.push(activeTab === "operator" ? "/operator" : "/passenger");
        }, 800);
      } else {
        setErrorMsg(res.error || "Invalid credentials. Please try again.");
      }
    }
  };

  const handleQuickDemo = (role: "passenger" | "operator" | "admin" | "driver") => {
    quickDemoLogin(role as any);
    setSuccessMsg(`Switched to demo profile: ${DEMO_USERS[role].name}`);
    setTimeout(() => {
      if (role === "driver") {
        router.push("/driver");
      } else if (role === "operator" || role === "admin") {
        router.push("/operator");
      } else {
        router.push("/passenger");
      }
    }, 600);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-slate-950">
      {/* Background Ambience Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Main Card */}
        <div className="glass-panel border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl bg-slate-900/80">
          {/* Header Brand */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 text-white shadow-[0_0_25px_rgba(34,211,238,0.4)] mb-3">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              SafeBus <span className="text-cyan-400">Nexus</span> Access
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Secure Unified Transit Intelligence & Realtime Command Portal
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-1.5 rounded-2xl border border-white/10 mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab("passenger");
                setErrorMsg("");
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                activeTab === "passenger"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Passenger App</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("operator");
                setErrorMsg("");
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                activeTab === "operator"
                  ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Command Center</span>
            </button>
          </div>

          {/* Quick Demo Credentials Bar */}
          <div className="mb-6 p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/25">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant 1-Click Demo Profiles</span>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono">No password required</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemo("passenger")}
                className="px-2 py-1.5 rounded-xl bg-slate-900/90 hover:bg-blue-600/30 text-slate-200 border border-white/10 text-[10px] font-medium transition flex items-center gap-1 justify-center truncate"
              >
                <span>👤 Rahul</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("driver")}
                className="px-2 py-1.5 rounded-xl bg-slate-900/90 hover:bg-cyan-600/30 text-slate-200 border border-white/10 text-[10px] font-medium transition flex items-center gap-1 justify-center truncate"
              >
                <span>🚍 Suresh (Pilot)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("operator")}
                className="px-2 py-1.5 rounded-xl bg-slate-900/90 hover:bg-indigo-600/30 text-slate-200 border border-white/10 text-[10px] font-medium transition flex items-center gap-1 justify-center truncate"
              >
                <span>👮‍♂️ David</span>
              </button>
            </div>
          </div>

          {/* Alert Banners */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-950/90 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address / Transit ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    activeTab === "operator"
                      ? "dispatcher@safebus.gov"
                      : "passenger@example.com"
                  }
                  className="w-full bg-slate-950/90 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(activeTab === "operator" ? "david.vance@safebus-nexus.gov" : "rahul.sharma@example.com");
                      setPassword("demo1234");
                    }}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    Auto-fill demo credentials
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/90 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white shadow-xl flex items-center justify-center gap-2 transition mt-2 ${
                activeTab === "operator"
                  ? "bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400"
                  : "bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 hover:from-blue-500 hover:to-teal-400"
              } disabled:opacity-50`}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {isSignUp
                      ? `Create ${activeTab === "operator" ? "Operator" : "Passenger"} Account`
                      : `Sign In to ${activeTab === "operator" ? "Command Center" : "Passenger Portal"}`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between Sign In and Sign Up */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className="text-xs text-slate-400 hover:text-white transition"
            >
              {isSignUp ? (
                <span>
                  Already have an account?{" "}
                  <strong className="text-cyan-400 hover:underline font-semibold">
                    Sign In
                  </strong>
                </span>
              ) : (
                <span>
                  New to SafeBus Nexus?{" "}
                  <strong className="text-cyan-400 hover:underline font-semibold">
                    Create Account
                  </strong>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Security Trust Badges */}
        <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5">
            <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supabase Auth Ready</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>256-Bit Encrypted</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-blue-400" />
            <span>Live GPS Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
}
