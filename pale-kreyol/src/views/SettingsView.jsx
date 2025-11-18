import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toggleDarkMode, resetAccountProgress } from "../firebase/userService";

export default function SettingsView() {
  const { user, profile, logout } = useAuth();
  const [loadingDark, setLoadingDark] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  if (!user || !profile) return null;

  const handleToggleDark = async () => {
    try {
      setLoadingDark(true);
      await toggleDarkMode(user.uid, profile.darkMode);
    } catch (e) {
      setError(e.message || "Failed to toggle theme");
    } finally {
      setLoadingDark(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset all your progress?")) return;
    try {
      setResetting(true);
      setMsg("");
      setError("");
      await resetAccountProgress(user.uid, { deleteResults: true });
      setMsg("Progress reset.");
    } catch (e) {
      setError(e.message || "Failed to reset progress");
    } finally {
      setResetting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 space-y-4">
      <h2 className="text-2xl font-bold text-center mb-2">Settings</h2>

      <div className="flex items-center justify-between">
        <span>Dark mode</span>
        <button
          onClick={handleToggleDark}
          disabled={loadingDark}
          className="px-4 py-2 rounded-xl border"
        >
          {profile.darkMode ? "Disable" : "Enable"}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span>Reset learning progress</span>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="px-4 py-2 rounded-xl border border-red-400 text-red-600">
          {resetting ? "Resetting..." : "Reset"}
        </button>
      </div>

      {msg && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 p-2 rounded-lg">
          {msg}
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded-lg">
          {error}
        </div>
      )}

      <button
        onClick={handleLogout}
        className="w-full bg-gray-100 text-gray-800 py-3 rounded-xl mt-4">
        Logout
      </button>
    </div>
  );
}
