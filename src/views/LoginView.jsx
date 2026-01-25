import React, { useState } from "react";
import { loginWithEmail, loginWithGoogle } from "../firebase/authService";

export default function LoginView({ onSuccess, goRegister, goForgot }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      await loginWithEmail(email, password, rememberMe);
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
      await loginWithGoogle(rememberMe);
      onSuccess();
    } catch (e) {
      setError(e.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 space-y-4">
      <h2 className="text-2xl font-bold text-center">Login</h2>

      <input
        type="email"
        className="w-full p-3 border rounded-xl"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />

      <input
        type="password"
        className="w-full p-3 border rounded-xl"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={() => setRememberMe(!rememberMe)}
        />
        <span className="text-sm">Remember me</span>

        <button className="ml-auto text-blue-600 text-sm" onClick={goForgot}>
          Forgot password?
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <button
        className="w-full bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition"
        disabled={loading}
        onClick={handleLogin}
      >
        {loading ? "Loading..." : "Login"}
      </button>

      <button
        className="w-full bg-red-500 text-white p-3 rounded-xl hover:bg-red-600 transition"
        disabled={loading}
        onClick={handleGoogle}
      >
        Continue with Google
      </button>

      <p className="text-center text-sm">
        No account?{" "}
        <button className="text-blue-600" onClick={goRegister}>
          Create one
        </button>
      </p>
    </div>
  );
}