import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const storage = getStorage(); // uses default Firebase app

const countries = [
  { code: "HT", name: "Haiti" },
  { code: "TW", name: "Taiwan" },
  { code: "FR", name: "France" },
  { code: "US", name: "United States" },
];

export default function ProfileView() {
  const { user, profile } = useAuth();

  const [name, setName] = useState(profile?.name || "");
  const [country, setCountry] = useState(profile?.country || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!user) return null;

  const avatarUrl =
    profile?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      profile?.name || user.email || "User"
    )}&background=3b82f6&color=ffffff`;

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { name, country });
      setSuccess("Profile updated.");
    } catch (e) {
      setError(e.message || "Failed to save.");
    }
    setSaving(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const avatarRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(avatarRef, file);
      const url = await getDownloadURL(avatarRef);
      await updateUserProfile(user.uid, { avatar: url });
      setSuccess("Avatar updated.");
    } catch (e) {
      setError(e.message || "Failed to upload avatar.");
    }

    setSaving(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md space-y-6">

        <h2 className="text-2xl font-bold text-center">Your profile</h2>

        {/* Avatar */}
        <div className="flex flex-col items-center space-y-3">
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
          />
          <label className="text-sm text-blue-600 cursor-pointer">
            Change avatar
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Name */}
        <div>
          <label className="text-sm text-gray-600 font-medium">Name</label>
          <input
            className="mt-1 w-full border rounded-xl px-4 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        {/* Country */}
        <div>
          <label className="text-sm text-gray-600 font-medium">Country</label>
          <select
            className="mt-1 w-full border rounded-xl px-4 py-2"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="">Select country</option>
            {countries.map((c) => (
              <option key={c.code} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-100 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm text-green-700 bg-green-100 rounded-lg px-3 py-2">
            {success}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}
