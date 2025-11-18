import React, { useState } from "react";
import { resetPassword } from "../firebase/authService";

export default function ForgotPasswordView({ goLogin }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    try {
      setLoading(true);
      setError("");
      setMsg("");
      await resetPassword(email);
      setMsg("Reset link sent. Check your email.");
    } catch (e) {
      setError(e.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 space-y-4">
      <h2 className="text-2xl font-bold text-center">Reset password</h2>
      <p className="text-sm text-gray-600 text-center">
        Enter your email and we’ll send you a reset link.
      </p>

      <input
        className="w-full border rounded-xl p-3"
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading || !!msg}
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
        onClick={handleReset}
        disabled={loading || !email || !!msg}
        className="w-full bg-blue-600 text-white py-3 rounded-xl"
      >
        {loading ? "Sending..." : "Send reset link"}
      </button>

      <button
        onClick={goLogin}
        className="w-full mt-2 text-blue-600"
        disabled={loading}
      >
        Back to login
      </button>
    </div>
  );
}
