// src/views/SettingsView.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  updateUserProfile,
  resetUserProgress,
  LEVEL_NAMES,
  calculateLevel,
} from "../firebase/UserService.js";
import { updatePassword, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "../firebase/config";

// ── Small toggle component ────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`w-12 h-7 rounded-full flex items-center px-1 transition-all flex-shrink-0 ${
        value ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
          value ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {title && (
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
        </div>
      )}
      <div className="divide-y divide-gray-50">{children}</div>
    </div>
  );
}

// ── Row inside a section ──────────────────────────────────────────────
function Row({ icon, label, sublabel, right, onClick, danger }) {
  const content = (
    <div className={`flex items-center gap-3 px-4 py-3.5 ${onClick ? "cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition" : ""} ${danger ? "text-red-600" : ""}`}>
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? "text-red-600" : "text-gray-900"}`}>{label}</p>
        {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  );
  return onClick ? <div onClick={onClick}>{content}</div> : <div>{content}</div>;
}

// ── Confirm modal for destructive actions ─────────────────────────────
function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel, danger }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4">
        <div className="text-center">
          <div className="text-5xl mb-3">{danger ? "⚠️" : "❓"}</div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-2">{message}</p>
        </div>
        <div className="space-y-2 pt-2">
          <button
            onClick={onConfirm}
            className={`w-full py-3 rounded-2xl font-bold text-sm transition ${
              danger
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3 rounded-2xl font-semibold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit modal (generic text input) ──────────────────────────────────
function EditModal({ title, fields, onSave, onCancel, saving }) {
  const [values, setValues] = useState(
    Object.fromEntries(fields.map((f) => [f.key, f.value || ""]))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full mb-4 sm:mb-0 p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <div className="space-y-3">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-gray-500 block mb-1">{f.label}</label>
              <input
                type={f.type || "text"}
                value={values[f.key]}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
        <div className="space-y-2 pt-1">
          <button
            onClick={() => onSave(values)}
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-2xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={onCancel}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-2xl font-semibold text-sm hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────
export default function SettingsView() {
  const { user, profile, logoutUser } = useAuth();

  // UI state
  const [toast, setToast]               = useState("");        // success message
  const [modal, setModal]               = useState(null);      // which modal is open
  const [saving, setSaving]             = useState(false);

  // Profile fields (local editable copies)
  const [dark, setDark]     = useState(profile?.darkMode || false);
  const [notifs, setNotifs] = useState(profile?.notifications ?? true);

  // Sync from profile
  useEffect(() => {
    setDark(profile?.darkMode || false);
    setNotifs(profile?.notifications ?? true);
  }, [profile]);

  // Apply dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ── Handlers ─────────────────────────────────────────────────────

  const handleThemeToggle = async () => {
    const next = !dark;
    setDark(next);
    await updateUserProfile(user.uid, { darkMode: next });
  };

  const handleNotifsToggle = async () => {
    const next = !notifs;
    setNotifs(next);
    await updateUserProfile(user.uid, { notifications: next });
  };

  const handleSaveName = async ({ name }) => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { name: name.trim() });
      showToast("✅ Name updated!");
      setModal(null);
    } catch (e) {
      showToast("❌ " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCountry = async ({ country }) => {
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { country: country.trim() });
      showToast("✅ Country updated!");
      setModal(null);
    } catch (e) {
      showToast("❌ " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDailyGoal = async ({ dailyGoal }) => {
    const val = parseInt(dailyGoal);
    if (!val || val < 1) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { dailyGoal: val });
      showToast("✅ Daily goal updated!");
      setModal(null);
    } catch (e) {
      showToast("❌ " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async ({ currentPassword, newPassword, confirmPassword }) => {
    if (newPassword !== confirmPassword) { showToast("❌ Passwords don't match"); return; }
    if (newPassword.length < 6) { showToast("❌ Password must be at least 6 characters"); return; }
    setSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      showToast("✅ Password changed!");
      setModal(null);
    } catch (e) {
      showToast("❌ " + (e.code === "auth/wrong-password" ? "Current password is wrong" : e.message));
    } finally {
      setSaving(false);
    }
  };

  const handleResetProgress = async () => {
    setSaving(true);
    try {
      await resetUserProgress(user.uid);
      showToast("✅ Progress reset. Fresh start!");
      setModal(null);
    } catch (e) {
      showToast("❌ " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
  };

  // ── Derived display values ────────────────────────────────────────
  const xp        = profile?.xp || 0;
  const level     = calculateLevel(xp);
  const levelName = LEVEL_NAMES[level] || "";
  const streak    = profile?.streak || 0;
  const lessons   = profile?.completedLessons?.length || 0;
  const dialogs   = profile?.completedDialogs?.length || 0;
  const isPremium = profile?.subscription?.status === "active";

  // Mask email: user@example.com → us**@example.com
  const maskedEmail = user?.email
    ? user.email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + "*".repeat(Math.min(b.length, 4)) + c)
    : "";

  return (
    <div className="space-y-5 animate-fade-in pb-6">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-2xl shadow-xl">
          {toast}
        </div>
      )}

      {/* Modals */}
      {modal === "name" && (
        <EditModal
          title="Edit Display Name"
          fields={[{ key: "name", label: "Name", value: profile?.name, placeholder: "Your name" }]}
          onSave={handleSaveName}
          onCancel={() => setModal(null)}
          saving={saving}
        />
      )}
      {modal === "country" && (
        <EditModal
          title="Edit Country"
          fields={[{ key: "country", label: "Country", value: profile?.country, placeholder: "e.g. Haiti, USA..." }]}
          onSave={handleSaveCountry}
          onCancel={() => setModal(null)}
          saving={saving}
        />
      )}
      {modal === "goal" && (
        <EditModal
          title="Daily Learning Goal"
          fields={[{ key: "dailyGoal", label: "Minutes per day", value: profile?.dailyGoal?.toString() || "30", placeholder: "30", type: "number" }]}
          onSave={handleSaveDailyGoal}
          onCancel={() => setModal(null)}
          saving={saving}
        />
      )}
      {modal === "password" && (
        <EditModal
          title="Change Password"
          fields={[
            { key: "currentPassword", label: "Current password", placeholder: "••••••••", type: "password" },
            { key: "newPassword",     label: "New password",     placeholder: "••••••••", type: "password" },
            { key: "confirmPassword", label: "Confirm new password", placeholder: "••••••••", type: "password" },
          ]}
          onSave={handleChangePassword}
          onCancel={() => setModal(null)}
          saving={saving}
        />
      )}
      {modal === "reset" && (
        <ConfirmModal
          title="Reset All Progress?"
          message="This will permanently delete your XP, streak, completed lessons, dialogs, and badges. This cannot be undone."
          confirmLabel={saving ? "Resetting..." : "Yes, reset everything"}
          onConfirm={handleResetProgress}
          onCancel={() => setModal(null)}
          danger
        />
      )}
      {modal === "logout" && (
        <ConfirmModal
          title="Log out?"
          message="You'll need to sign in again to continue learning."
          confirmLabel="Log out"
          onConfirm={handleLogout}
          onCancel={() => setModal(null)}
        />
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">⚙️ Settings</h2>
        <p className="text-sm text-gray-500">Manage your profile and preferences</p>
      </div>

      {/* Profile card */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold border-2 border-white/40 overflow-hidden flex-shrink-0">
            {profile?.avatar
              ? <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
              : (profile?.name?.[0] || user?.email?.[0] || "?").toUpperCase()
            }
          </div>
          <div className="min-w-0">
            <p className="font-bold text-lg truncate">{profile?.name || "Learner"}</p>
            <p className="text-blue-200 text-sm truncate">{maskedEmail}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-white/20 text-xs font-bold px-2 py-0.5 rounded-full">
                Lv.{level} {levelName}
              </span>
              {isPremium && (
                <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                  ⭐ Premium
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { label: "XP",      value: xp.toLocaleString() },
            { label: "🔥 Streak", value: streak },
            { label: "Lessons", value: lessons },
            { label: "Dialogs", value: dialogs },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/15 rounded-xl py-2 text-center">
              <p className="font-bold text-sm">{value}</p>
              <p className="text-blue-200 text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Profile info */}
      <Section title="Profile">
        <Row
          icon="👤"
          label="Display Name"
          sublabel={profile?.name || "Not set"}
          right={<span className="text-xs text-blue-600 font-semibold">Edit</span>}
          onClick={() => setModal("name")}
        />
        <Row
          icon="🌍"
          label="Country"
          sublabel={profile?.country || "Not set"}
          right={<span className="text-xs text-blue-600 font-semibold">Edit</span>}
          onClick={() => setModal("country")}
        />
        <Row
          icon="🎯"
          label="Daily Goal"
          sublabel={`${profile?.dailyGoal || 30} minutes per day`}
          right={<span className="text-xs text-blue-600 font-semibold">Edit</span>}
          onClick={() => setModal("goal")}
        />
        <Row
          icon="📧"
          label="Email"
          sublabel={maskedEmail}
        />
      </Section>

      {/* Preferences */}
      <Section title="Preferences">
        <Row
          icon="🌙"
          label="Dark Mode"
          sublabel="Easier on the eyes at night"
          right={<Toggle value={dark} onChange={handleThemeToggle} />}
        />
        <Row
          icon="🔔"
          label="Notifications"
          sublabel="Daily reminders to keep your streak"
          right={<Toggle value={notifs} onChange={handleNotifsToggle} />}
        />
      </Section>

      {/* Account security */}
      <Section title="Account">
        <Row
          icon="🔒"
          label="Change Password"
          sublabel="Update your login password"
          right={<span className="text-gray-300 text-lg">›</span>}
          onClick={() => setModal("password")}
        />
        {!isPremium && (
          <Row
            icon="⭐"
            label="Upgrade to Premium"
            sublabel="Unlock AI tutor and unlimited lessons"
            right={<span className="text-yellow-500 font-bold text-xs">$9.99/mo</span>}
            onClick={() => {/* setCurrentView("subscription") — pass if needed */}}
          />
        )}
      </Section>

      {/* Danger zone */}
      <Section title="Danger Zone">
        <Row
          icon="🔄"
          label="Reset Learning Progress"
          sublabel="Wipes XP, streak, lessons, badges — cannot be undone"
          right={<span className="text-red-400 text-lg">›</span>}
          onClick={() => setModal("reset")}
          danger
        />
        <Row
          icon="🚪"
          label="Log Out"
          sublabel="Sign out of your account"
          right={<span className="text-gray-300 text-lg">›</span>}
          onClick={() => setModal("logout")}
        />
      </Section>

      {/* App info */}
      <div className="text-center space-y-1 py-2">
        <p className="text-xs text-gray-400">Pale Kreyòl · Learn Haitian Creole</p>
        <p className="text-xs text-gray-300">Version 2.0</p>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity:0; transform: translateY(8px); }
          to   { opacity:1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in .25s ease-out; }
      `}</style>
    </div>
  );
}