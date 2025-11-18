import React, { useState } from "react";
import { registerWithEmail } from "../firebase/authService";

export default function RegisterView({ goLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError("");
      setMsg("");
      await registerWithEmail(email, password);
      setMsg("Account created. Please check your email to verify.");
    } catch (e) {
      setError(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 space-y-4">
      <h2 className="text-2xl font-bold text-center">Create account</h2>

      <input
        className="w-full border rounded-xl p-3"
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />

      <input
        className="w-full border rounded-xl p-3"
        type="password"
        placeholder="Password (min 6 chars)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
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
        onClick={handleRegister}
        disabled={loading || !email || password.length < 6}
        className="w-full bg-green-600 text-white py-3 rounded-xl"
      >
        {loading ? "Creating..." : "Sign up"}
      </button>

      <p className="text-sm text-center">
        Already have an account?{" "}
        <button className="text-blue-600" onClick={goLogin} disabled={loading}>
          Login
        </button>
      </p>
    </div>
  );
}
