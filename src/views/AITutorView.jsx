// src/views/AITutorView.jsx
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const FREE_LIMIT = 10; // messages before paywall

const SCENARIOS = [
  { id: "general",   label: "💬 Free Talk",   prompt: "General Haitian Creole conversation practice." },
  { id: "market",    label: "🛒 Mache a",      prompt: "Simulate a conversation at a Haitian market." },
  { id: "greetings", label: "👋 Bonjou!",      prompt: "Practice Haitian Creole greetings and introductions." },
  { id: "family",    label: "👨‍👩‍👧 Fanmi",  prompt: "Talking about family members in Haitian Creole." },
  { id: "numbers",   label: "🔢 Chif",         prompt: "Practice numbers and counting in Haitian Creole." },
];

export default function AITutorView({ setCurrentView }) {
  const { user, profile, isPremium } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Bonjou! Mwen se Manman Kreyol 🇭🇹\nI'm your AI Haitian Creole tutor. Type anything in English or Creole and I'll help you practice!\n\n_Kijan ou rele?_ (What's your name?)",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [scenario, setScenario] = useState("general");
  const [error, setError] = useState("");

  // Count only user messages sent this session
  const [userMessageCount, setUserMessageCount] = useState(0);
  const limitReached = !isPremium && userMessageCount >= FREE_LIMIT;

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading || limitReached) return;

    const newCount = userMessageCount + 1;
    setUserMessageCount(newCount);

    const userMsg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const token = await user.getIdToken();
      const selectedScenario = SCENARIOS.find((s) => s.id === scenario);

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: next.map(({ role, content }) => ({ role, content })),
          scenario: selectedScenario?.prompt || "",
          userLevel: profile?.level || 1,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Request failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "", streaming: true }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
        for (const line of lines) {
          const data = line.replace("data: ", "");
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            fullText += parsed.text;
            setMessages((prev) => [
              ...prev.slice(0, -1),
              { role: "assistant", content: fullText, streaming: true },
            ]);
          } catch {}
        }
      }

      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: fullText },
      ]);
    } catch (e) {
      setError(
        e.message.includes("Rate limit")
          ? "⏳ You've reached the hourly limit. Try again soon."
          : "⚠️ Connection error. Check your internet and try again."
      );
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const remainingMessages = Math.max(0, FREE_LIMIT - userMessageCount);

  return (
    <div className="flex flex-col h-screen max-h-screen -mt-6 -mx-4">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
          M
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-900">Manman Kreyol</p>
          <p className="text-xs text-green-500">● AI Tutor · Online</p>
        </div>
        {/* Message counter — only show for free users */}
        {!isPremium && (
          <div className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            remainingMessages <= 3
              ? "bg-red-100 text-red-600"
              : "bg-gray-100 text-gray-500"
          }`}>
            {limitReached ? "0 left" : `${remainingMessages} left`}
          </div>
        )}
      </div>

      {/* Scenario pills */}
      <div className="bg-white border-b border-gray-100 px-4 py-2 flex gap-2 overflow-x-auto flex-shrink-0">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => setScenario(s.id)}
            className={`whitespace-nowrap text-xs px-3 py-1.5 rounded-full font-medium transition ${
              scenario === s.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-br from-blue-50 to-purple-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs sm:max-w-sm px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none"
              }`}
            >
              {msg.content}
              {msg.streaming && (
                <span className="inline-block w-1.5 h-4 bg-current ml-1 animate-pulse rounded" />
              )}
            </div>
          </div>
        ))}

        {error && (
          <div className="text-center text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── PAYWALL — shown when limit reached ── */}
      {limitReached ? (
        <div className="bg-white border-t border-gray-200 px-4 py-5 flex-shrink-0 mb-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 text-white text-center">
            <p className="text-2xl mb-1">🔒</p>
            <p className="font-bold text-base">You've used your 10 free messages</p>
            <p className="text-sm text-blue-100 mt-1 mb-3">
              Upgrade to Premium for unlimited AI conversation practice
            </p>
            <button
              onClick={() => setCurrentView("subscription")}
              className="w-full bg-white text-blue-700 font-bold py-2.5 rounded-xl hover:bg-blue-50 transition text-sm"
            >
              Upgrade to Premium →
            </button>
            <p className="text-xs text-blue-200 mt-2">$9.99/month · Cancel anytime</p>
          </div>
        </div>
      ) : (
        /* ── Normal input ── */
        <div className="bg-white border-t border-gray-200 px-4 py-3 flex gap-2 flex-shrink-0 mb-16">
          {/* Low messages warning */}
          {!isPremium && remainingMessages <= 3 && remainingMessages > 0 && (
            <div className="absolute bottom-24 left-4 right-4 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 text-xs text-orange-700 text-center">
              ⚠️ {remainingMessages} free message{remainingMessages !== 1 ? "s" : ""} remaining —{" "}
              <button
                onClick={() => setCurrentView("subscription")}
                className="font-bold underline"
              >
                upgrade for unlimited
              </button>
            </div>
          )}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Ekri an Kreyol... (Write in Creole)"
            className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-40 transition text-sm"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      )}
    </div>
  );
}