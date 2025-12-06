import React, { useState } from "react";
import { registerWithEmail } from "../firebase/authService";

export default function RegisterView({ goLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError("");
      setMsg("");

      await registerWithEmail(email, password);

      setMsg("Account created! Please check your inbox to verify your email.");
    } catch (e) {
      setError(e.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 space-y-4">
      <h2 className="text-2xl font-bold text-center">Create Account</h2>

      <input
        type="email"
        className="w-full p-3 border rounded-xl"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />

      <input
        type="password"
        className="w-full p-3 border rounded-xl"
        placeholder="Password (min 6 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />

      {msg && (
        <div className="text-sm bg-green-50 border border-green-200 text-green-700 p-2 rounded-lg">
          {msg}
        </div>
      )}

      {error && (
        <div className="text-sm bg-red-50 border border-red-200 text-red-700 p-2 rounded-lg">
          {error}
        </div>
      )}

      <button
        onClick={handleRegister}
        disabled={loading || !email || password.length < 6}
        className="w-full bg-green-600 text-white py-3 rounded-xl"
      >
        {loading ? "Creating..." : "Sign Up"}
      </button>

      <p className="text-sm text-center">
        Already have an account?{" "}
        <button className="text-blue-600" onClick={goLogin}>
          Login
        </button>
      </p>
    </div>
  );
}
