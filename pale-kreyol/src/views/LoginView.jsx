import React, { useState } from "react";
import { loginWithEmail, loginWithGoogle } from "../firebase/authService";

export default function LoginView({ onSuccess, goRegister, goForgot }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    try {
      setLoading(true);
      setError("");
      await loginWithEmail(email, password, remember);
      onSuccess();
    } catch (e) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      setError("");
      await loginWithGoogle(remember);
      onSuccess();
    } catch (e) {
      setError(e.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 space-y-4">
      <h2 className="text-2xl font-bold text-center">Welcome back</h2>

      <input
        className="w-full border rounded-xl p-3"
        type="email"
        placeholder="Email"
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

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            disabled={loading}
          />
          <span>Remember me</span>
        </label>
        <button
          className="text-blue-600"
          onClick={goForgot}
          disabled={loading}
        >
          Forgot password?
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded-lg">
          {error}
        </div>
      )}

      <button
        onClick={handleEmailLogin}
        disabled={loading || !email || password.length < 6}
        className="w-full bg-blue-600 text-white py-3 rounded-xl"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <button
        onClick={handleGoogle}
        disabled={loading}
        className="w-full bg-white border mt-2 py-3 rounded-xl"
      >
        Continue with Google
      </button>

      <p className="text-sm text-center">
        Don’t have an account?{" "}
        <button className="text-blue-600" onClick={goRegister} disabled={loading}>
          Create one
        </button>
      </p>
    </div>
  );
}
