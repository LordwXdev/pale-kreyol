import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { updateUserProfile, resetUserProgress } from "../firebase/userService.js";

export default function SettingsView({ resetAll }) {
  const { user, profile, logout } = useAuth();
  const [dark, setDark] = useState(profile?.darkMode || false);
  const [savingTheme, setSavingTheme] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    // sync profile changes
    setDark(profile?.darkMode || false);
  }, [profile]);

  useEffect(() => {
    // apply dark mode to document
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  const handleThemeToggle = async () => {
    if (!user) return;
    const newValue = !dark;
    setDark(newValue);
    setSavingTheme(true);
    try {
      await updateUserProfile(user.uid, { darkMode: newValue });
    } finally {
      setSavingTheme(false);
    }
  };

  const handleResetAccount = async () => {
    if (!user) return;
    const ok = confirm("Reset all your XP, streak and lessons?");
    if (!ok) return;
    setResetting(true);
    try {
      await resetUserProgress(user.uid);
      if (resetAll) resetAll(); // also clear local state from App.jsx
    } finally {
      setResetting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">Settings</h2>

      {/* Theme */}
      <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Dark mode</h3>
          <p className="text-sm text-gray-500">
            Make the interface darker and easier on your eyes.
          </p>
        </div>
        <button
          onClick={handleThemeToggle}
          className={`w-14 h-8 rounded-full flex items-center px-1 transition-all ${
            dark ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <div
            className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform ${
              dark ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Progress summary */}
      <div className="bg-white rounded-xl p-4 shadow-sm grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-xl font-bold">{profile?.xp || 0}</div>
          <div className="text-xs text-gray-500">XP</div>
        </div>
        <div>
          <div className="text-xl font-bold">{profile?.streak || 0}</div>
          <div className="text-xs text-gray-500">Streak</div>
        </div>
        <div>
          <div className="text-xl font-bold">
            {profile?.completedLessons?.length || 0}
          </div>
          <div className="text-xs text-gray-500">Lessons</div>
        </div>
      </div>

      {/* Reset account */}
      <button
        onClick={handleResetAccount}
        disabled={resetting}
        className="w-full bg-red-50 text-red-600 border border-red-200 rounded-xl py-3 font-semibold hover:bg-red-100"
      >
        {resetting ? "Resetting..." : "Reset learning progress"}
      </button>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full bg-gray-800 text-white rounded-xl py-3 font-semibold hover:bg-black"
      >
        Logout
      </button>

      <style>{`
        @keyframes fade-in {
          from { opacity:0; transform: translateY(8px); }
          to   { opacity:1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in .25s ease-out;
        }
      `}</style>
    </div>
  );
}
