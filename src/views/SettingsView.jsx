// src/views/SettingsView.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  updateUserProfile,
  resetUserProgress,
  LEVEL_NAMES,
  calculateLevel,
} from "../firebase/UserService.js";
import {
  updatePassword,
  updateEmail,
  updatePhoneNumber,
  EmailAuthProvider,
  reauthenticateWithCredential,
  PhoneAuthProvider,
  linkWithCredential,
  unlink,
} from "firebase/auth";
import { auth } from "../firebase/config";

// ── Toggle ────────────────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`w-12 h-7 rounded-full flex items-center px-1 transition-all flex-shrink-0 ${
        value ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${value ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

// ── Section ───────────────────────────────────────────────────────────
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

// ── Row ───────────────────────────────────────────────────────────────
function Row({ icon, label, sublabel, right, onClick, danger }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3.5 ${onClick ? "cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition" : ""}`}
    >
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? "text-red-600" : "text-gray-900"}`}>{label}</p>
        {sublabel && <p className="text-xs text-gray-400 mt-0.5 truncate">{sublabel}</p>}
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  );
}

// ── Confirm modal ─────────────────────────────────────────────────────
function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel, danger, loading }) {
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
            disabled={loading}
            className={`w-full py-3 rounded-2xl font-bold text-sm transition disabled:opacity-50 ${
              danger ? "bg-red-600 text-white hover:bg-red-700" : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loading ? "Please wait..." : confirmLabel}
          </button>
          <button onClick={onCancel} className="w-full py-3 rounded-2xl font-semibold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Generic edit modal ────────────────────────────────────────────────
function EditModal({ title, subtitle, fields, onSave, onCancel, saving, error }) {
  const [values, setValues] = useState(
    Object.fromEntries(fields.map((f) => [f.key, f.value || ""]))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full mb-4 sm:mb-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          {subtitle && <p className="text-blue-200 text-xs mt-0.5">{subtitle}</p>}
        </div>

        <div className="p-6 space-y-3">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-gray-500 block mb-1">{f.label}</label>
              {f.type === "select" ? (
                <select
                  value={values[f.key]}
                  onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                >
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type || "text"}
                  value={values[f.key]}
                  onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  disabled={f.disabled}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 disabled:opacity-50"
                />
              )}
              {f.hint && <p className="text-xs text-gray-400 mt-1">{f.hint}</p>}
            </div>
          ))}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-2 pt-1">
            <button
              onClick={() => onSave(values)}
              disabled={saving}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-2xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button onClick={onCancel} className="w-full bg-gray-100 text-gray-700 py-3 rounded-2xl font-semibold text-sm hover:bg-gray-200 transition">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────
export default function SettingsView({ setCurrentView }) {
  const { user, profile, logoutUser } = useAuth();

  const [modal, setModal]     = useState(null);
  const [saving, setSaving]   = useState(false);
  const [modalError, setModalError] = useState("");
  const [toast, setToast]     = useState("");
  const [dark, setDark]       = useState(profile?.darkMode || false);
  const [notifs, setNotifs]   = useState(profile?.notifications ?? true);

  useEffect(() => { setDark(profile?.darkMode || false); setNotifs(profile?.notifications ?? true); }, [profile]);
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };
  const openModal = (id) => { setModal(id); setModalError(""); };
  const closeModal = () => { setModal(null); setModalError(""); setSaving(false); };

  // Re-auth helper — required before sensitive changes
  const reauth = async (password) => {
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(auth.currentUser, credential);
  };

  // ── Save handlers ─────────────────────────────────────────────────

  const handleSaveName = async ({ name }) => {
    if (!name.trim()) { setModalError("Name cannot be empty"); return; }
    setSaving(true); setModalError("");
    try {
      await updateUserProfile(user.uid, { name: name.trim() });
      showToast("✅ Display name updated!");
      closeModal();
    } catch (e) { setModalError(e.message); } finally { setSaving(false); }
  };

  const handleSaveUsername = async ({ username }) => {
    if (!username.trim()) { setModalError("Username cannot be empty"); return; }
    if (username.includes(" ")) { setModalError("Username cannot contain spaces"); return; }
    if (username.length < 3) { setModalError("Username must be at least 3 characters"); return; }
    setSaving(true); setModalError("");
    try {
      await updateUserProfile(user.uid, { username: username.trim().toLowerCase() });
      showToast("✅ Username updated!");
      closeModal();
    } catch (e) { setModalError(e.message); } finally { setSaving(false); }
  };

  const handleSaveEmail = async ({ newEmail, currentPassword }) => {
    if (!newEmail.trim()) { setModalError("Email cannot be empty"); return; }
    if (!currentPassword) { setModalError("Current password is required"); return; }
    setSaving(true); setModalError("");
    try {
      await reauth(currentPassword);
      await updateEmail(auth.currentUser, newEmail.trim());
      await updateUserProfile(user.uid, { email: newEmail.trim() });
      showToast("✅ Email updated! Check your inbox to verify.");
      closeModal();
    } catch (e) {
      if (e.code === "auth/wrong-password") setModalError("Incorrect password");
      else if (e.code === "auth/email-already-in-use") setModalError("This email is already in use");
      else if (e.code === "auth/invalid-email") setModalError("Invalid email address");
      else setModalError(e.message);
    } finally { setSaving(false); }
  };

  const handleSavePassword = async ({ currentPassword, newPassword, confirmPassword }) => {
    if (!currentPassword) { setModalError("Current password is required"); return; }
    if (newPassword.length < 6) { setModalError("New password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { setModalError("Passwords don't match"); return; }
    setSaving(true); setModalError("");
    try {
      await reauth(currentPassword);
      await updatePassword(auth.currentUser, newPassword);
      showToast("✅ Password changed successfully!");
      closeModal();
    } catch (e) {
      if (e.code === "auth/wrong-password") setModalError("Current password is incorrect");
      else setModalError(e.message);
    } finally { setSaving(false); }
  };

  const handleSavePhone = async ({ phone }) => {
    if (!phone.trim()) { setModalError("Phone number cannot be empty"); return; }
    if (!phone.startsWith("+")) { setModalError("Include country code, e.g. +1 or +509"); return; }
    setSaving(true); setModalError("");
    try {
      // Save to Firestore profile (for display purposes)
      await updateUserProfile(user.uid, { phone: phone.trim() });
      showToast("✅ Phone number updated!");
      closeModal();
    } catch (e) { setModalError(e.message); } finally { setSaving(false); }
  };

  const handleSaveCountry = async ({ country }) => {
    setSaving(true); setModalError("");
    try {
      await updateUserProfile(user.uid, { country: country.trim() });
      showToast("✅ Country updated!");
      closeModal();
    } catch (e) { setModalError(e.message); } finally { setSaving(false); }
  };

  const handleSaveDailyGoal = async ({ dailyGoal }) => {
    const val = parseInt(dailyGoal);
    if (!val || val < 1) { setModalError("Please enter a valid number of minutes"); return; }
    setSaving(true); setModalError("");
    try {
      await updateUserProfile(user.uid, { dailyGoal: val });
      showToast("✅ Daily goal updated!");
      closeModal();
    } catch (e) { setModalError(e.message); } finally { setSaving(false); }
  };

  const handleSaveLanguage = async ({ motherLanguage }) => {
    setSaving(true); setModalError("");
    try {
      await updateUserProfile(user.uid, { motherLanguage });
      showToast("✅ Language updated!");
      closeModal();
    } catch (e) { setModalError(e.message); } finally { setSaving(false); }
  };

  const handleThemeToggle = async () => {
    const next = !dark; setDark(next);
    await updateUserProfile(user.uid, { darkMode: next }).catch(() => {});
  };

  const handleNotifsToggle = async () => {
    const next = !notifs; setNotifs(next);
    await updateUserProfile(user.uid, { notifications: next }).catch(() => {});
  };

  const handleResetProgress = async () => {
    setSaving(true);
    try {
      await resetUserProgress(user.uid);
      showToast("✅ Progress reset. Fresh start!");
      closeModal();
    } catch (e) { setModalError(e.message); } finally { setSaving(false); }
  };

  const handleDeleteAccount = async ({ currentPassword }) => {
    if (!currentPassword) { setModalError("Password required to delete account"); return; }
    setSaving(true); setModalError("");
    try {
      await reauth(currentPassword);
      // Delete Firestore data first
      await resetUserProgress(user.uid);
      // Delete Firebase auth account
      await auth.currentUser.delete();
      showToast("Account deleted.");
    } catch (e) {
      if (e.code === "auth/wrong-password") setModalError("Incorrect password");
      else setModalError(e.message);
    } finally { setSaving(false); }
  };

  // ── Derived values ────────────────────────────────────────────────
  const xp        = profile?.xp || 0;
  const level     = calculateLevel(xp);
  const levelName = LEVEL_NAMES[level] || "";
  const streak    = profile?.streak || 0;
  const lessons   = profile?.completedLessons?.length || 0;
  const dialogs   = profile?.completedDialogs?.length || 0;
  const isPremium = profile?.subscription?.status === "active";

  const displayEmail = user?.email
    ? user.email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + "*".repeat(Math.min(b.length, 5)) + c)
    : "Not set";

  const displayPhone = profile?.phone
    ? profile.phone.slice(0, 4) + "****" + profile.phone.slice(-3)
    : "Not set";

  // ── Modals config ─────────────────────────────────────────────────
  const MODALS = {
    name: {
      title: "Display Name", subtitle: "Shown on your profile and leaderboard",
      fields: [{ key: "name", label: "Full name", value: profile?.name, placeholder: "Your name" }],
      onSave: handleSaveName,
    },
    username: {
      title: "Username", subtitle: "Your unique @handle",
      fields: [{ key: "username", label: "Username (no spaces)", value: profile?.username, placeholder: "e.g. kreyol_learner", hint: "Lowercase letters, numbers, underscores only" }],
      onSave: handleSaveUsername,
    },
    email: {
      title: "Change Email", subtitle: "You'll need to verify your current password",
      fields: [
        { key: "newEmail", label: "New email address", placeholder: "new@email.com", type: "email" },
        { key: "currentPassword", label: "Current password (to confirm)", placeholder: "••••••••", type: "password" },
      ],
      onSave: handleSaveEmail,
    },
    password: {
      title: "Change Password", subtitle: "Must be at least 6 characters",
      fields: [
        { key: "currentPassword", label: "Current password", placeholder: "••••••••", type: "password" },
        { key: "newPassword", label: "New password", placeholder: "••••••••", type: "password" },
        { key: "confirmPassword", label: "Confirm new password", placeholder: "••••••••", type: "password" },
      ],
      onSave: handleSavePassword,
    },
    phone: {
      title: "Phone Number", subtitle: "Include your country code",
      fields: [{ key: "phone", label: "Phone number", value: profile?.phone, placeholder: "+509 1234 5678", hint: "+1 USA, +509 Haiti, +33 France…" }],
      onSave: handleSavePhone,
    },
    country: {
      title: "Country", subtitle: "Where are you learning from?",
      fields: [{ key: "country", label: "Country", value: profile?.country, placeholder: "e.g. Haiti, USA, Canada…" }],
      onSave: handleSaveCountry,
    },
    language: {
      title: "Mother Language", subtitle: "Helps us tailor explanations for you",
      fields: [{
        key: "motherLanguage", label: "Your native language",
        value: profile?.motherLanguage || "English",
        type: "select",
        options: [
          "English","French","Spanish","Portuguese","Arabic",
          "Haitian Creole","Mandarin","Swahili","Other"
        ].map((l) => ({ value: l, label: l })),
      }],
      onSave: handleSaveLanguage,
    },
    goal: {
      title: "Daily Learning Goal", subtitle: "How many minutes per day?",
      fields: [{ key: "dailyGoal", label: "Minutes per day", value: profile?.dailyGoal?.toString() || "30", placeholder: "30", type: "number" }],
      onSave: handleSaveDailyGoal,
    },
    deleteAccount: {
      title: "Delete Account", subtitle: "⚠️ This permanently deletes all your data",
      fields: [{ key: "currentPassword", label: "Enter your password to confirm", placeholder: "••••••••", type: "password" }],
      onSave: handleDeleteAccount,
    },
  };

  const activeModal = modal && MODALS[modal];

  return (
    <div className="space-y-5 animate-fade-in pb-6">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-2xl shadow-xl whitespace-nowrap">
          {toast}
        </div>
      )}

      {/* Edit modal */}
      {activeModal && (
        <EditModal
          title={activeModal.title}
          subtitle={activeModal.subtitle}
          fields={activeModal.fields}
          onSave={activeModal.onSave}
          onCancel={closeModal}
          saving={saving}
          error={modalError}
        />
      )}

      {/* Reset confirm modal */}
      {modal === "reset" && (
        <ConfirmModal
          title="Reset All Progress?"
          message="This will permanently delete your XP, streak, completed lessons, dialogs, and badges. This cannot be undone."
          confirmLabel="Yes, reset everything"
          onConfirm={handleResetProgress}
          onCancel={closeModal}
          danger
          loading={saving}
        />
      )}

      {/* Logout confirm modal */}
      {modal === "logout" && (
        <ConfirmModal
          title="Log out?"
          message="You'll need to sign in again to continue learning."
          confirmLabel="Log out"
          onConfirm={logoutUser}
          onCancel={closeModal}
        />
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">⚙️ Settings</h2>
        <p className="text-sm text-gray-500">Manage your account and preferences</p>
      </div>

      {/* Profile card */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold border-2 border-white/40 flex-shrink-0 overflow-hidden">
            {profile?.avatar
              ? <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
              : (profile?.name?.[0] || user?.email?.[0] || "?").toUpperCase()
            }
          </div>
          <div className="min-w-0">
            <p className="font-bold text-lg truncate">{profile?.name || "Learner"}</p>
            {profile?.username && <p className="text-blue-200 text-sm">@{profile.username}</p>}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
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
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { label: "XP",      value: xp.toLocaleString() },
            { label: "🔥",      value: streak },
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

      {/* ── ACCOUNT INFORMATION ── */}
      <Section title="Account Information">
        <Row icon="👤" label="Display Name"    sublabel={profile?.name || "Not set"}          right={<span className="text-xs text-blue-600 font-semibold">Edit</span>} onClick={() => openModal("name")} />
        <Row icon="🏷️" label="Username"        sublabel={profile?.username ? `@${profile.username}` : "Not set"} right={<span className="text-xs text-blue-600 font-semibold">Edit</span>} onClick={() => openModal("username")} />
        <Row icon="🌍" label="Country"         sublabel={profile?.country || "Not set"}        right={<span className="text-xs text-blue-600 font-semibold">Edit</span>} onClick={() => openModal("country")} />
        <Row icon="🗣️" label="Mother Language" sublabel={profile?.motherLanguage || "Not set"} right={<span className="text-xs text-blue-600 font-semibold">Edit</span>} onClick={() => openModal("language")} />
        <Row icon="🎯" label="Daily Goal"      sublabel={`${profile?.dailyGoal || 30} minutes per day`} right={<span className="text-xs text-blue-600 font-semibold">Edit</span>} onClick={() => openModal("goal")} />
      </Section>

      {/* ── LOGIN & SECURITY ── */}
      <Section title="Login & Security">
        <Row icon="📧" label="Email Address"  sublabel={displayEmail}  right={<span className="text-xs text-blue-600 font-semibold">Change</span>} onClick={() => openModal("email")} />
        <Row icon="📱" label="Phone Number"   sublabel={displayPhone}  right={<span className="text-xs text-blue-600 font-semibold">Edit</span>}   onClick={() => openModal("phone")} />
        <Row icon="🔒" label="Password"       sublabel="Change your login password" right={<span className="text-xs text-blue-600 font-semibold">Change</span>} onClick={() => openModal("password")} />
      </Section>

      {/* ── PREFERENCES ── */}
      <Section title="Preferences">
        <Row icon="🌙" label="Dark Mode"      sublabel="Easier on the eyes at night"       right={<Toggle value={dark}   onChange={handleThemeToggle}  />} />
        <Row icon="🔔" label="Notifications"  sublabel="Daily reminders to keep your streak" right={<Toggle value={notifs} onChange={handleNotifsToggle} />} />
      </Section>

      {/* ── SUBSCRIPTION ── */}
      <Section title="Subscription">
        {isPremium ? (
          <Row icon="⭐" label="Premium Active" sublabel="You have unlimited access to all features" right={<span className="text-xs text-green-600 font-bold">Active</span>} />
        ) : (
          <Row icon="⭐" label="Upgrade to Premium" sublabel="Unlock AI tutor · Unlimited practice · No ads" right={<span className="text-xs text-yellow-600 font-bold">$9.99/mo</span>} onClick={() => setCurrentView?.("subscription")} />
        )}
      </Section>

      {/* ── DANGER ZONE ── */}
      <Section title="Danger Zone">
        <Row icon="🔄" label="Reset Learning Progress" sublabel="Wipes XP, streak, lessons, badges"       right={<span className="text-red-400 text-lg">›</span>} onClick={() => openModal("reset")}         danger />
        <Row icon="🗑️" label="Delete Account"          sublabel="Permanently delete your account and data" right={<span className="text-red-400 text-lg">›</span>} onClick={() => openModal("deleteAccount")} danger />
        <Row icon="🚪" label="Log Out"                 sublabel="Sign out of your account"                 right={<span className="text-gray-300 text-lg">›</span>} onClick={() => openModal("logout")} />
      </Section>

      {/* App info */}
      <div className="text-center space-y-1 py-2">
        <p className="text-xs text-gray-400">Pale Kreyòl · Learn Haitian Creole</p>
        <p className="text-xs text-gray-300">Version 2.0</p>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in .25s ease-out; }
      `}</style>
    </div>
  );
}