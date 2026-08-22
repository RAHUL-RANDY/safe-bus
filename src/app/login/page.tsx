"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  Bus,
  BadgeCheck,
} from "lucide-react";
import { useAuth, DEMO_USERS } from "@/lib/auth-context";
import SafeBusLogo from "@/components/common/SafeBusLogo";

export default function LoginPage() {
  const router = useRouter();
  const { login, signUp, quickDemoLogin } = useAuth();

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
        }, 800);
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
        }, 600);
      } else {
        setErrorMsg(res.error || "Invalid credentials. Please try again.");
      }
    }
  };

  const handleQuickDemo = (role: "passenger" | "operator" | "admin" | "driver") => {
    quickDemoLogin(role);
    setSuccessMsg(`Authenticated as ${DEMO_USERS[role].name}. Redirecting...`);
    setTimeout(() => {
      if (role === "driver") {
        router.push("/driver");
      } else if (role === "operator" || role === "admin") {
        router.push("/operator");
      } else {
        router.push("/passenger");
      }
    }, 500);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-950">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Header Brand */}
          <div className="text-center mb-6 flex flex-col items-center">
            <SafeBusLogo size="lg" animated={true} subText="Unified Enterprise Public Transit & Fleet Operations" />
          </div>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 mb-5">
            <button
              type="button"
              onClick={() => {
                setActiveTab("passenger");
                setErrorMsg("");
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                activeTab === "passenger"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
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
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                activeTab === "operator"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Command Center</span>
            </button>
          </div>

          {/* Quick Demo Credentials Bar */}
          <div className="mb-5 p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Click Test Access</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">No password required</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemo("passenger")}
                className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium transition flex items-center gap-1 justify-center truncate"
              >
                <span>👤 Rahul</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("driver")}
                className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium transition flex items-center gap-1 justify-center truncate"
              >
                <span>🚍 Suresh (Pilot)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("operator")}
                className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium transition flex items-center gap-1 justify-center truncate"
              >
                <span>👮‍♂️ David</span>
              </button>
            </div>
          </div>

          {/* Alert Banners */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-950 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address / Transit ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    activeTab === "operator"
                      ? "david.vance@safebus.gov"
                      : "rahul.sharma@example.com"
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(activeTab === "operator" ? "david.vance@safebus-nexus.gov" : "rahul.sharma@example.com");
                      setPassword("password123");
                    }}
                    className="text-[11px] text-blue-400 hover:underline"
                  >
                    Auto-fill demo credentials
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 shadow transition flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
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
          <div className="mt-4 pt-3 border-t border-slate-800 text-center">
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
                  <strong className="text-blue-400 hover:underline font-semibold">
                    Sign In
                  </strong>
                </span>
              ) : (
                <span>
                  New to SafeBus?{" "}
                  <strong className="text-blue-400 hover:underline font-semibold">
                    Create Account
                  </strong>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Security Trust Badges */}
        <div className="mt-5 flex items-center justify-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supabase Cloud Sync</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>256-Bit Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
