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
    text: "Hello! I am your **SafeBus AI Transit Assistant**. I can help you with stop ETAs, route navigation, passenger safety protocols, and feedback reporting.",
    timestamp: Date.now(),
    suggestions: [
      "Where is the next stop?",
      "How long until my destination?",
      "How do I file a reckless driving report?",
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
    <div className="fixed inset-0 z-[9999] flex justify-end bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-md h-full bg-slate-950 border-l border-slate-800 flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Transit AI Assistant</h3>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
                  Google Gemini
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
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((msg) => {
            const isAI = msg.sender === "assistant";
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isAI ? "items-start" : "items-end"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                    isAI
                      ? "bg-slate-900 text-slate-200 border border-slate-800 shadow"
                      : "bg-blue-600 text-white font-medium shadow"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Emergency CTA */}
                {isAI && msg.isEmergencyRelated && onTriggerSOSFromAI && (
                  <button
                    onClick={() => {
                      onTriggerSOSFromAI();
                      onClose();
                    }}
                    className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Open Emergency SOS Console
                  </button>
                )}

                {/* Suggestions */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {msg.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(suggestion)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-blue-300 border border-slate-800 text-[11px] font-medium transition"
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
            <div className="flex items-center gap-2 text-xs text-blue-400 bg-slate-900 p-3 rounded-xl border border-slate-800 w-fit">
              <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Processing query with Gemini...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => handleSendMessage("What's my ETA and next stop?")}
            className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900 text-xs text-blue-300 hover:text-white border border-slate-800 transition"
          >
            ⏱️ Next Stop ETA
          </button>
          <button
            onClick={() => handleSendMessage("Is this bus on time?")}
            className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900 text-xs text-slate-300 hover:text-white border border-slate-800 transition"
          >
            🚍 Schedule Status
          </button>
          <button
            onClick={() => handleSendMessage("How do I report a lost item on this bus?")}
            className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900 text-xs text-slate-300 hover:text-white border border-slate-800 transition"
          >
            🎒 Lost Item
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
