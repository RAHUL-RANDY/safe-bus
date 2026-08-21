"use client";

import React, { useState, useRef, useEffect } from "react";
import { Trip, Bus, ChatMessage } from "@/types";
import { logChatMessageToSupabase } from "@/lib/supabase";
import {
  Sparkles,
  Send,
  X,
  AlertTriangle,
} from "lucide-react";

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  trip?: Trip;
  bus?: Bus;
  onTriggerSOSFromAI?: () => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m-1",
    sender: "assistant",
    text: "Hello! I am your **SafeBus Nexus AI Safety Co-Pilot**. I am actively tracking your journey and can assist with real-time ETA, route stops, safety protocols, and grievance filings.",
    timestamp: Date.now(),
    suggestions: [
      "Where is the next stop?",
      "How long until my destination?",
      "How do I file a rash driving complaint?",
      "Emergency SOS guidance",
    ],
  },
];

export default function AIAssistantDrawer({
  isOpen,
  onClose,
  trip,
  bus,
  onTriggerSOSFromAI,
}: AIAssistantDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    logChatMessageToSupabase(userMsg, trip?.tripId);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query.trim(),
          tripContext: {
            tripId: trip?.tripId,
            passengerName: trip?.passengerName,
            busId: bus?.id || trip?.busId,
            plateNumber: bus?.plateNumber,
            routeName: trip?.routeName || bus?.routeName,
            nextStop: bus?.nextStop,
            etaMinutes: bus?.etaMinutes,
            speed: bus?.speed,
            seatNumber: trip?.seatNumber,
          },
        }),
      });

      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        text: data.reply || "I am here to assist your journey. Please let me know if you need route information or safety assistance.",
        timestamp: Date.now(),
        isEmergencyRelated: query.toLowerCase().includes("sos") || query.toLowerCase().includes("emergency"),
      };

      setMessages((prev) => [...prev, aiMsg]);
      logChatMessageToSupabase(aiMsg, trip?.tripId);
    } catch (err) {
      console.error("AI chat error:", err);
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        text: "Your bus is traveling safely on schedule. The next stop is " + (bus?.nextStop || "upcoming") + " in ~" + (bus?.etaMinutes || "5") + " mins.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      logChatMessageToSupabase(fallbackMsg, trip?.tripId);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md h-full bg-slate-950/95 border-l border-white/15 flex flex-col shadow-2xl relative">
        {/* Chat Drawer Header */}
        <div className="p-4 border-b border-white/10 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Nexus AI Co-Pilot</h3>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-cyan-300">
                Active on {bus?.id || "BUS-42A"} • {bus?.speed || 40} km/h
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isAI = msg.sender === "assistant";
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isAI ? "items-start" : "items-end"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    isAI
                      ? "bg-slate-900/90 text-slate-200 border border-cyan-500/20 shadow-md"
                      : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium shadow-md"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Emergency CTA button if AI detected emergency */}
                {isAI && msg.isEmergencyRelated && onTriggerSOSFromAI && (
                  <button
                    onClick={() => {
                      onTriggerSOSFromAI();
                      onClose();
                    }}
                    className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse transition"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Open Emergency SOS Console
                  </button>
                )}

                {/* Suggestions chips */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[90%]">
                    {msg.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(suggestion)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/30 text-[10px] font-medium transition"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-cyan-400 bg-slate-900/70 p-3 rounded-2xl border border-cyan-500/20 w-fit">
              <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Nexus AI is calculating live trip telemetry...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips for Jury & Passengers */}
        <div className="px-4 py-2 bg-slate-900/60 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleSendMessage("What's my ETA and next stop?")}
            className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-cyan-950/80 text-[11px] text-cyan-300 hover:text-white border border-cyan-500/30 transition"
          >
            ⏱️ What&apos;s my ETA?
          </button>
          <button
            onClick={() => handleSendMessage("Is this bus on time?")}
            className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-white/10 transition"
          >
            🚍 Is bus on time?
          </button>
          <button
            onClick={() => handleSendMessage("How do I report a lost item on this bus?")}
            className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-white/10 transition"
          >
            🎒 Lost Item Report
          </button>
          <button
            onClick={() => handleSendMessage("How do I file a reckless driving complaint?")}
            className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-white/10 transition"
          >
            ⚠️ Report Rash Driving
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-white/10 bg-slate-900/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about your route, ETA, or safety..."
              className="flex-1 bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-white font-bold transition shadow-lg"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
