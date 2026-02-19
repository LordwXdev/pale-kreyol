// src/views/LeaderboardView.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getLeaderboard, LEVEL_NAMES } from "../firebase/UserService";

export default function LeaderboardView() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const MEDALS = ["🥇", "🥈", "🥉"];

  useEffect(() => {
    getLeaderboard(50).then((data) => {
      setLeaders(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">🏆 Leaderboard</h2>
        <p className="text-sm text-gray-500">Top Haitian Creole learners worldwide</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-2">
          {leaders.map((entry, i) => {
            const isMe = entry.uid === user?.uid;
            return (
              <div
                key={entry.uid}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition ${
                  isMe
                    ? "bg-blue-50 border-blue-300 shadow-sm"
                    : "bg-white border-gray-100"
                }`}
              >
                {/* Rank */}
                <div className="w-8 text-center font-bold text-gray-500 text-sm">
                  {i < 3 ? MEDALS[i] : `#${entry.rank}`}
                </div>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
                  {entry.avatar ? (
                    <img src={entry.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    entry.name?.[0]?.toUpperCase() || "?"
                  )}
                </div>

                {/* Name + level */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {entry.name}
                    {isMe && <span className="text-blue-500 ml-1 text-xs">(You)</span>}
                  </p>
                  <p className="text-xs text-gray-400">
                    Lv.{entry.level} {LEVEL_NAMES[entry.level] || ""} · 🔥 {entry.streak}d
                  </p>
                </div>

                {/* XP */}
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-blue-600 text-sm">{entry.xp.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">XP</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// src/views/SubscriptionView.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Export this as a separate component below but keep in same file for delivery
export function SubscriptionView({ setCurrentView }) {
  const { isPremium, user } = useAuth();
  const [loading, setLoading] = useState(null);

  const handleUpgrade = async (priceId, planName) => {
    setLoading(planName);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}`,
          cancelUrl: `${window.location.origin}`,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      alert("Checkout failed: " + e.message);
    } finally {
      setLoading(null);
    }
  };

  const PLANS = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: ["5 lessons/week", "Basic quizzes", "XP & streak tracking", "Leaderboard"],
      priceId: null,
      highlighted: false,
    },
    {
      name: "Premium Monthly",
      price: "$9.99",
      period: "/month",
      features: [
        "Unlimited lessons",
        "🤖 AI Conversation Tutor",
        "Grammar correction",
        "AI-generated quizzes",
        "Spaced repetition",
        "Personalized learning path",
        "Offline PWA access",
      ],
      priceId: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID,
      highlighted: true,
    },
    {
      name: "Yearly",
      price: "$79.99",
      period: "/year",
      features: ["Everything in Monthly", "Save 33%", "Exclusive badges", "Early feature access"],
      priceId: import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID,
      highlighted: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Upgrade Your Journey</h2>
        <p className="text-gray-500 text-sm mt-1">Unlock AI tutoring and unlimited learning</p>
        {isPremium && (
          <div className="mt-3 inline-block bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-medium">
            ✅ You're Premium — Mèsi!
          </div>
        )}
      </div>

      <div className="space-y-4">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`bg-white rounded-2xl p-5 border-2 transition ${
              plan.highlighted ? "border-blue-500 shadow-lg shadow-blue-100" : "border-gray-100"
            }`}
          >
            {plan.highlighted && (
              <div className="mb-2">
                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </span>
              </div>
            )}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900">{plan.name}</h3>
                <p className="text-xs text-gray-500">{plan.period}</p>
              </div>
              <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
            </div>
            <ul className="space-y-1 mb-4">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => plan.priceId && handleUpgrade(plan.priceId, plan.name)}
              disabled={!plan.priceId || isPremium || loading === plan.name}
              className={`w-full py-2.5 rounded-xl font-semibold text-sm transition ${
                plan.highlighted
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading === plan.name ? "Redirecting..." : isPremium ? "Current Plan" : plan.priceId ? "Upgrade Now" : "Current Plan"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// src/views/AdminView.jsx
// ─────────────────────────────────────────────────────────────────────────────
export function AdminView({ setCurrentView }) {
  const { isAdmin, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState("users");
  const [loading, setLoading] = useState(false);
  const [lessonForm, setLessonForm] = useState({ title: "", category: "basics", content: "", xpReward: 50, premium: false });
  const [savingLesson, setSavingLesson] = useState(false);

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">🚫</div>
        <p className="text-gray-500">Admin access only.</p>
      </div>
    );
  }

  const loadUsers = async () => {
    const { getAllUsers } = await import("../firebase/UserService");
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  const handleBan = async (uid, banned) => {
    const { setBanStatus } = await import("../firebase/UserService");
    await setBanStatus(uid, banned);
    loadUsers();
  };

  const handleRole = async (uid, role) => {
    const { setUserRole } = await import("../firebase/UserService");
    await setUserRole(uid, role);
    loadUsers();
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    setSavingLesson(true);
    const { addDoc, collection, serverTimestamp } = await import("firebase/firestore");
    const { db } = await import("../firebase/config");
    await addDoc(collection(db, "lessons"), {
      ...lessonForm,
      order: Date.now(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setLessonForm({ title: "", category: "basics", content: "", xpReward: 50, premium: false });
    setSavingLesson(false);
    alert("✅ Lesson saved to Firestore!");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">🛡️ Admin</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {["users", "lessons"].map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); if (t === "users") loadUsers(); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              tab === t ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t === "users" ? "👥 Users" : "📚 Add Lesson"}
          </button>
        ))}
      </div>

      {/* Users tab */}
      {tab === "users" && (
        <div className="space-y-2">
          {loading && <p className="text-center text-gray-400 py-6">Loading...</p>}
          {users.map((u) => (
            <div key={u.uid} className="bg-white rounded-xl p-3 border border-gray-100 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">{u.name || u.email}</p>
                <p className="text-xs text-gray-400">
                  {u.role} · {u.xp} XP · {u.email}
                </p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleRole(u.uid, u.role === "admin" ? "user" : "admin")}
                  className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-lg hover:bg-purple-200"
                >
                  {u.role === "admin" ? "→User" : "→Admin"}
                </button>
                <button
                  onClick={() => handleBan(u.uid, !u.banned)}
                  className={`text-xs px-2 py-1 rounded-lg ${
                    u.banned
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  }`}
                >
                  {u.banned ? "Unban" : "Ban"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Lesson tab */}
      {tab === "lessons" && (
        <form onSubmit={handleSaveLesson} className="space-y-3 bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-800">Add New Lesson</h3>
          <input
            type="text"
            placeholder="Lesson title"
            value={lessonForm.title}
            onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
          <select
            value={lessonForm.category}
            onChange={(e) => setLessonForm({ ...lessonForm, category: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="basics">Basics</option>
            <option value="greetings">Greetings</option>
            <option value="grammar">Grammar</option>
            <option value="vocabulary">Vocabulary</option>
            <option value="culture">Culture</option>
          </select>
          <textarea
            placeholder="Lesson content..."
            value={lessonForm.content}
            onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs text-gray-500 block mb-1">XP Reward</label>
              <input
                type="number"
                value={lessonForm.xpReward}
                onChange={(e) => setLessonForm({ ...lessonForm, xpReward: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                min={10} max={500}
              />
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                id="premium"
                checked={lessonForm.premium}
                onChange={(e) => setLessonForm({ ...lessonForm, premium: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="premium" className="text-sm text-gray-700">Premium only</label>
            </div>
          </div>
          <button
            type="submit"
            disabled={savingLesson}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition"
          >
            {savingLesson ? "Saving..." : "✅ Save Lesson"}
          </button>
        </form>
      )}
    </div>
  );
}
