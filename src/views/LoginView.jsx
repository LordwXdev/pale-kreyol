// src/views/LoginView.jsx
import React, { useState } from "react";
import {
  loginWithEmail,
  loginWithGoogle,
  setupRecaptcha,
  sendPhoneCode,
  verifyPhoneCode,
} from "../firebase/authService";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

function Input({ type = "text", placeholder, value, onChange, disabled, onKeyDown }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      onKeyDown={onKeyDown}
      className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 disabled:opacity-50 transition"
    />
  );
}

export default function LoginView({ onSuccess, goRegister, goForgot }) {
  const [tab, setTab]                       = useState("email"); // "email" | "phone"
  const [email, setEmail]                   = useState("");
  const [password, setPassword]             = useState("");
  const [showPassword, setShowPassword]     = useState(false);
  const [phoneNumber, setPhoneNumber]       = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [rememberMe, setRememberMe]         = useState(true);
  const [error, setError]                   = useState("");
  const [loading, setLoading]               = useState(false);

  const friendlyError = (e) => {
    switch (e.code) {
      case "auth/user-not-found":
      case "auth/invalid-credential":   return "No account found. Please sign up first.";
      case "auth/wrong-password":       return "Incorrect password. Please try again.";
      case "auth/invalid-email":        return "Invalid email address.";
      case "auth/user-disabled":        return "This account has been disabled.";
      case "auth/too-many-requests":    return "Too many attempts. Please try again later.";
      case "auth/popup-closed-by-user": return "Sign-in cancelled. Please try again.";
      case "auth/popup-blocked":        return "Popup blocked. Please allow popups for this site.";
      default:                          return e.message || "Something went wrong. Please try again.";
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return;
    try {
      setLoading(true); setError("");
      await loginWithEmail(email.trim(), password, rememberMe);
      onSuccess();
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setLoading(true); setError("");
      await loginWithGoogle(rememberMe);
      onSuccess();
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    if (!phoneNumber.startsWith("+")) {
      setError("Include country code, e.g. +50912345678");
      return;
    }
    try {
      setLoading(true); setError("");
      const rv = setupRecaptcha("recaptcha-container");
      await rv.render();
      const confirmation = await sendPhoneCode(phoneNumber, rv);
      setConfirmationResult(confirmation);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      setLoading(true); setError("");
      await verifyPhoneCode(confirmationResult, verificationCode);
      onSuccess();
    } catch (e) {
      setError(e.code === "auth/invalid-verification-code"
        ? "Invalid code. Please try again."
        : friendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-10">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🇭🇹</div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Pale Kreyòl
        </h1>
        <p className="text-gray-500 text-sm mt-1">Learn Haitian Creole with joy</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-xl font-bold text-gray-900">Welcome back</h2>
          <p className="text-sm text-gray-500 mt-0.5">Sign in to continue your journey</p>
        </div>

        {/* Tab switcher */}
        <div className="px-6">
          <div className="flex bg-gray-100 rounded-2xl p-1">
            {["email", "phone"].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); setConfirmationResult(null); }}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                  tab === t ? "bg-white shadow-sm text-blue-600" : "text-gray-500"
                }`}
              >
                {t === "email" ? "📧 Email" : "📱 Phone"}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 space-y-3">
          {/* EMAIL */}
          {tab === "email" && (
            <>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe((v) => !v)}
                    className="w-4 h-4 rounded accent-blue-600"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <button
                  onClick={goForgot}
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading || !email || !password}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-2xl font-bold text-sm hover:opacity-90 disabled:opacity-40 transition"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-2xl font-semibold text-sm hover:bg-gray-50 disabled:opacity-40 transition"
              >
                <GoogleIcon />
                Continue with Google
              </button>
            </>
          )}

          {/* PHONE */}
          {tab === "phone" && (
            <>
              {!confirmationResult ? (
                <>
                  <Input
                    type="tel"
                    placeholder="+509 1234 5678 (with country code)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={loading}
                  />
                  <div id="recaptcha-container" />
                  <button
                    onClick={handleSendCode}
                    disabled={loading || !phoneNumber}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-2xl font-bold text-sm hover:opacity-90 disabled:opacity-40 transition"
                  >
                    {loading ? "Sending..." : "Send Code"}
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-sm text-green-700">
                    ✅ Code sent to <span className="font-semibold">{phoneNumber}</span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                    disabled={loading}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl text-center text-3xl tracking-[0.5em] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                  <button
                    onClick={handleVerifyCode}
                    disabled={loading || verificationCode.length !== 6}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-2xl font-bold text-sm hover:opacity-90 disabled:opacity-40 transition"
                  >
                    {loading ? "Verifying..." : "Verify Code"}
                  </button>
                  <button
                    onClick={() => { setConfirmationResult(null); setVerificationCode(""); setError(""); }}
                    className="w-full bg-gray-100 text-gray-600 py-2.5 rounded-2xl text-sm font-medium hover:bg-gray-200 transition"
                  >
                    ← Change number
                  </button>
                </>
              )}
            </>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl">
              {error}
            </div>
          )}

          {/* Register link */}
          <p className="text-center text-sm text-gray-500 pt-1">
            New to Pale Kreyòl?{" "}
            <button onClick={goRegister} className="text-blue-600 font-bold hover:underline">
              Create account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}