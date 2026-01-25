import React, { useState } from "react";
import { resetPassword } from "../firebase/authService";
import { auth, db } from "../firebase/config";

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

      setMsg("Reset link sent! Check your inbox.");
    } catch (e) {
      setError(e.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 space-y-4">
      <h2 className="text-2xl font-bold text-center">Reset Password</h2>

      <input
        type="email"
        placeholder="Enter your email"
        className="w-full p-3 border rounded-xl"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />

      {msg && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 p-2 rounded-lg">
          {msg}
        </div>
      )}

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-2 rounded-lg">
          {error}
        </div>
      )}

      <button
        onClick={handleReset}
        disabled={!email || loading}
        className="w-full bg-blue-600 text-white py-3 rounded-xl"
      >
        {loading ? "Sending..." : "Send reset link"}
      </button>

      <p className="text-sm text-center">
        Remember your password?{" "}
        <button className="text-blue-600" onClick={goLogin}>
          Login
        </button>
      </p>
    </div>
  );
}
