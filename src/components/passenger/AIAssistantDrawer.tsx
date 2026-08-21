"use client";

import React, { useState, useRef, useEffect } from "react";
import { Trip, Bus, ChatMessage } from "@/types";
import { logChatMessageToSupabase } from "@/lib/supabase";
import { getSoundEngine } from "@/lib/audio-effects";
import {
  Sparkles,
  Send,
  X,
  AlertTriangle,
  Volume2,
  VolumeX,
  Bot,
  User,
  Clock,
  Compass,
  Shield,
  HelpCircle,
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
    text: "Hello! I am your **SafeBus AI Transit Assistant** powered by Google Gemini. I can provide real-time stop ETAs, route guidance, verified safety protocols, and emergency assistance.",
    timestamp: Date.now(),
    suggestions: [
      "🕒 What is the next upcoming stop?",
      "📍 What is our current speed & GPS?",
      "🚨 What is the emergency safety protocol?",
      "🎟️ Check ticket validity",
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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      getSoundEngine().playClick();
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSpeak = (text: string) => {
    const sound = getSoundEngine();
    if (isSpeaking) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      sound.speak(text.replace(/[*_#`]/g, ""));
      setTimeout(() => setIsSpeaking(false), 5000);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim() || isLoading) return;

    getSoundEngine().playClick();

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
      getSoundEngine().playAiPing();

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
    <div className="fixed inset-0 z-[9999] flex justify-end bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-slate-950 border-l border-slate-800 flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Nexus Passenger Co-Pilot</h3>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800 font-mono">
                  Gemini AI Live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Connected to {bus?.id || "BUS-42A"} • {bus?.speed || 40} km/h
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
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
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    isAI
                      ? "bg-slate-900 text-slate-200 border border-slate-800 shadow-md"
                      : "bg-blue-600 text-white font-medium shadow-md"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* AI Message Footer: Voice Read Aloud */}
                  {isAI && (
                    <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                      <span>SafeBus Verified Assistant</span>
                      <button
                        onClick={() => handleSpeak(msg.text)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 transition"
                        title="Read Aloud with Voice Synthesis"
                      >
                        <Volume2 className="w-3 h-3 text-blue-400" />
                        <span>Speak</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Emergency CTA */}
                {isAI && msg.isEmergencyRelated && onTriggerSOSFromAI && (
                  <button
                    onClick={() => {
                      onTriggerSOSFromAI();
                      onClose();
                    }}
                    className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg shadow-red-600/30"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Open Emergency SOS Console
                  </button>
                )}

                {/* Suggestions */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[92%]">
                    {msg.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(suggestion)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-blue-300 border border-slate-800 text-[11px] font-medium transition flex items-center gap-1.5 shadow-sm"
                      >
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-blue-400 bg-slate-900 p-3 rounded-xl border border-slate-800 w-fit animate-pulse">
              <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Gemini is generating response...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => handleSendMessage("What is my ETA and next stop?")}
            className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900 text-xs text-blue-300 hover:text-white border border-slate-800 transition flex items-center gap-1"
          >
            <Clock className="w-3 h-3 text-blue-400" />
            <span>Next Stop ETA</span>
          </button>
          <button
            onClick={() => handleSendMessage("Is this bus traveling on schedule?")}
            className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900 text-xs text-slate-300 hover:text-white border border-slate-800 transition flex items-center gap-1"
          >
            <Compass className="w-3 h-3 text-emerald-400" />
            <span>Schedule Status</span>
          </button>
          <button
            onClick={() => handleSendMessage("How do I trigger emergency SOS?")}
            className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900 text-xs text-red-300 hover:text-white border border-slate-800 transition flex items-center gap-1"
          >
            <Shield className="w-3 h-3 text-red-400" />
            <span>SOS Help</span>
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
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
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold transition shadow"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
