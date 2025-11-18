import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../firebase/userService";

export default function ProfileView() {
  const { user, profile } = useAuth();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile) return;
    setName(profile.name || "");
    setCountry(profile.country || "");
    setAvatar(profile.avatar || "");
  }, [profile]);

  if (!user || !profile) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setMsg("");
      await updateProfile(user.uid, { name, country, avatar });
      setMsg("Profile updated");
    } catch (e) {
      setError(e.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 space-y-4">
      <h2 className="text-2xl font-bold text-center">Profile</h2>

      <input
        className="w-full border rounded-xl p-3"
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={saving}
      />

      <input
        className="w-full border rounded-xl p-3"
        type="text"
        placeholder="Country"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        disabled={saving}
      />

      <input
        className="w-full border rounded-xl p-3"
        type="text"
        placeholder="Avatar image URL"
        value={avatar}
        onChange={(e) => setAvatar(e.target.value)}
        disabled={saving}
      />

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
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-blue-600 text-white py-3 rounded-xl"
      >
        {saving ? "Saving..." : "Save changes"}
      </button>
    </div>
  );
}
