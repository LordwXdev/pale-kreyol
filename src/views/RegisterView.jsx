// src/views/RegisterView.jsx
import React, { useState } from "react";
import {
  registerWithEmail,
  setupRecaptcha,
  sendPhoneCode,
  verifyPhoneCode,
} from "../firebase/authService";
import { updateUserProfile } from "../firebase/UserService";
import { auth } from "../firebase/config";

// ── Data for onboarding questions ─────────────────────────────────────
const LANGUAGES = [
  "English", "French", "Spanish", "Portuguese", "Arabic",
  "Haitian Creole", "Mandarin", "Swahili", "Other",
];

const DAILY_GOALS = [
  { value: 5,   label: "5 min",  desc: "Casual — just a quick habit" },
  { value: 15,  label: "15 min", desc: "Regular — steady progress" },
  { value: 30,  label: "30 min", desc: "Serious — learn faster" },
  { value: 60,  label: "1 hour", desc: "Intensive — full immersion" },
];

const LEARNING_REASONS = [
  { value: "heritage",  icon: "🏠", label: "Connect with my heritage" },
  { value: "travel",    icon: "✈️", label: "Travel to Haiti" },
  { value: "family",    icon: "👨‍👩‍👧", label: "Talk with family" },
  { value: "work",      icon: "💼", label: "Professional reasons" },
  { value: "culture",   icon: "🎶", label: "Love the culture" },
  { value: "fun",       icon: "😄", label: "Just for fun" },
];

const EXPERIENCE_LEVELS = [
  { value: "none",         label: "Zero",         desc: "I know nothing yet" },
  { value: "beginner",     label: "A little",     desc: "I know a few words" },
  { value: "intermediate", label: "Some",         desc: "I can have basic conversations" },
  { value: "advanced",     label: "Quite a bit",  desc: "I'm fairly fluent" },
];

// ── Reusable components ───────────────────────────────────────────────
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

function StepDots({ total, current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i < current
              ? "w-6 h-2 bg-blue-600"
              : i === current
              ? "w-6 h-2 bg-blue-400"
              : "w-2 h-2 bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

function SelectCard({ selected, onClick, children, small }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-2xl border-2 transition-all ${
        small ? "px-3 py-2.5" : "px-4 py-3"
      } ${
        selected
          ? "border-blue-500 bg-blue-50 shadow-sm"
          : "border-gray-100 bg-white hover:border-blue-200 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────
export default function RegisterView({ goLogin }) {
  // Step: 0=account, 1=onboarding-q1, 2=onboarding-q2, 3=onboarding-q3, 4=onboarding-q4, 5=done
  const TOTAL_STEPS = 6;
  const [step, setStep]           = useState(0);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  // Account fields
  const [regType, setRegType]       = useState("email");
  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [confirmPass, setConfirmPass] = useState("");
  const [phone, setPhone]           = useState("");
  const [verCode, setVerCode]       = useState("");
  const [confirmResult, setConfirmResult] = useState(null);
  const [codeSent, setCodeSent]     = useState(false);

  // Onboarding answers
  const [motherLanguage, setMotherLanguage]   = useState("");
  const [dailyGoal, setDailyGoal]             = useState(15);
  const [reason, setReason]                   = useState("");
  const [experience, setExperience]           = useState("");

  // Created user uid (set after account creation, used to save onboarding)
  const [createdUid, setCreatedUid]           = useState(null);

  // ── Step 0: Create account ────────────────────────────────────────
  const handleCreateEmail = async () => {
    if (!name.trim())                  { setError("Please enter your name"); return; }
    if (password.length < 6)           { setError("Password must be at least 6 characters"); return; }
    if (password !== confirmPass)      { setError("Passwords don't match"); return; }
    setLoading(true); setError("");
    try {
      const user = await registerWithEmail(email.trim(), password);
      // Save name immediately
      await updateUserProfile(user.uid, { name: name.trim() });
      setCreatedUid(user.uid);
      setStep(1);
    } catch (e) {
      switch (e.code) {
        case "auth/email-already-in-use": setError("An account with this email already exists."); break;
        case "auth/invalid-email":        setError("Invalid email address."); break;
        case "auth/weak-password":        setError("Password is too weak."); break;
        default:                          setError(e.message || "Failed to create account.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneCode = async () => {
    if (!phone.startsWith("+")) { setError("Include country code, e.g. +509..."); return; }
    setLoading(true); setError("");
    try {
      const rv = setupRecaptcha("recaptcha-container");
      await rv.render();
      const result = await sendPhoneCode(phone, rv);
      setConfirmResult(result);
      setCodeSent(true);
    } catch (e) {
      setError(e.message || "Failed to send code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhoneCode = async () => {
    setLoading(true); setError("");
    try {
      const user = await verifyPhoneCode(confirmResult, verCode);
      if (name.trim()) await updateUserProfile(user.uid, { name: name.trim() });
      setCreatedUid(user.uid);
      setStep(1);
    } catch (e) {
      setError(e.code === "auth/invalid-verification-code"
        ? "Invalid code. Try again."
        : e.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // ── Save onboarding + go to next step ────────────────────────────
  const saveOnboarding = async (extraData = {}) => {
    const uid = createdUid || auth.currentUser?.uid;
    if (uid) {
      await updateUserProfile(uid, extraData).catch(() => {});
    }
  };

  // ── Final step — save everything ──────────────────────────────────
  const handleFinish = async () => {
    setLoading(true);
    try {
      await saveOnboarding({
        motherLanguage,
        dailyGoal,
        learningReason: reason,
        experienceLevel: experience,
        onboardingComplete: true,
      });
      setStep(5);
    } catch (e) {
      setStep(5); // go to done even if save fails
    } finally {
      setLoading(false);
    }
  };

  // ── Progress bar width ────────────────────────────────────────────
  const progressPercent = Math.round((step / (TOTAL_STEPS - 1)) * 100);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-10">

      {/* Logo */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🇭🇹</div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Pale Kreyòl
        </h1>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

        {/* Progress bar */}
        {step > 0 && step < 5 && (
          <div className="h-1.5 bg-gray-100 w-full">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        <div className="px-6 pt-6 pb-6 space-y-4">

          {/* ── STEP 0: Account creation ── */}
          {step === 0 && (
            <>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create your account</h2>
                <p className="text-sm text-gray-500 mt-0.5">Join thousands learning Haitian Creole</p>
              </div>

              {/* Method tabs */}
              <div className="flex bg-gray-100 rounded-2xl p-1">
                {["email", "phone"].map((t) => (
                  <button
                    key={t}
                    onClick={() => { setRegType(t); setError(""); setCodeSent(false); }}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                      regType === t ? "bg-white shadow-sm text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {t === "email" ? "📧 Email" : "📱 Phone"}
                  </button>
                ))}
              </div>

              {/* Name — always shown */}
              <input
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 disabled:opacity-50"
              />

              {/* Email fields */}
              {regType === "email" && (
                <>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 disabled:opacity-50"
                  />
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      placeholder="Password (min 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? "Hide" : "Show"}
                    </button>
                  </div>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 disabled:opacity-50"
                  />

                  {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2.5 rounded-2xl">{error}</p>}

                  <button
                    onClick={handleCreateEmail}
                    disabled={loading || !name || !email || !password || !confirmPass}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-2xl font-bold text-sm hover:opacity-90 disabled:opacity-40 transition"
                  >
                    {loading ? "Creating account..." : "Create Account →"}
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400">or</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  <button
                    onClick={async () => {
                      setLoading(true); setError("");
                      try {
                        const { loginWithGoogle } = await import("../firebase/authService");
                        const user = await loginWithGoogle(true);
                        if (name.trim()) await updateUserProfile(user.uid, { name: name.trim() });
                        setCreatedUid(user.uid);
                        setStep(1);
                      } catch (e) {
                        setError(e.message || "Google sign-in failed.");
                      } finally { setLoading(false); }
                    }}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-2xl font-semibold text-sm hover:bg-gray-50 disabled:opacity-40 transition"
                  >
                    <GoogleIcon /> Continue with Google
                  </button>
                </>
              )}

              {/* Phone fields */}
              {regType === "phone" && !codeSent && (
                <>
                  <input
                    type="tel"
                    placeholder="+509 1234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                  <p className="text-xs text-gray-400">Include country code (+509 Haiti, +1 USA…)</p>
                  <div id="recaptcha-container" />
                  {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2.5 rounded-2xl">{error}</p>}
                  <button
                    onClick={handleSendPhoneCode}
                    disabled={loading || !name || !phone}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-2xl font-bold text-sm hover:opacity-90 disabled:opacity-40 transition"
                  >
                    {loading ? "Sending..." : "Send Code →"}
                  </button>
                </>
              )}

              {regType === "phone" && codeSent && (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-sm text-green-700">
                    ✅ Code sent to <span className="font-semibold">{phone}</span>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={verCode}
                    onChange={(e) => setVerCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl text-center text-3xl tracking-[0.5em] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                  {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2.5 rounded-2xl">{error}</p>}
                  <button
                    onClick={handleVerifyPhoneCode}
                    disabled={loading || verCode.length !== 6}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-2xl font-bold text-sm hover:opacity-90 disabled:opacity-40 transition"
                  >
                    {loading ? "Verifying..." : "Verify →"}
                  </button>
                  <button
                    onClick={() => { setCodeSent(false); setVerCode(""); setError(""); }}
                    className="w-full bg-gray-100 text-gray-600 py-2.5 rounded-2xl text-sm font-medium hover:bg-gray-200 transition"
                  >
                    ← Change number
                  </button>
                </>
              )}

              <p className="text-center text-sm text-gray-500 pt-1">
                Already have an account?{" "}
                <button onClick={goLogin} className="text-blue-600 font-bold hover:underline">Sign in</button>
              </p>
            </>
          )}

          {/* ── STEP 1: Mother language ── */}
          {step === 1 && (
            <>
              <StepDots total={4} current={0} />
              <div className="text-center mb-2">
                <div className="text-4xl mb-2">🌍</div>
                <h2 className="text-xl font-bold text-gray-900">What's your mother language?</h2>
                <p className="text-sm text-gray-500 mt-1">We'll tailor explanations to help you better</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.map((lang) => (
                  <SelectCard
                    key={lang}
                    selected={motherLanguage === lang}
                    onClick={() => setMotherLanguage(lang)}
                    small
                  >
                    <span className={`text-sm font-medium ${motherLanguage === lang ? "text-blue-700" : "text-gray-700"}`}>
                      {motherLanguage === lang ? "✓ " : ""}{lang}
                    </span>
                  </SelectCard>
                ))}
              </div>
              <button
                onClick={() => { saveOnboarding({ motherLanguage }); setStep(2); }}
                disabled={!motherLanguage}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-2xl font-bold text-sm hover:opacity-90 disabled:opacity-40 transition"
              >
                Continue →
              </button>
            </>
          )}

          {/* ── STEP 2: Daily goal ── */}
          {step === 2 && (
            <>
              <StepDots total={4} current={1} />
              <div className="text-center mb-2">
                <div className="text-4xl mb-2">🎯</div>
                <h2 className="text-xl font-bold text-gray-900">Daily learning goal</h2>
                <p className="text-sm text-gray-500 mt-1">How much time can you commit each day?</p>
              </div>
              <div className="space-y-2">
                {DAILY_GOALS.map((g) => (
                  <SelectCard
                    key={g.value}
                    selected={dailyGoal === g.value}
                    onClick={() => setDailyGoal(g.value)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-bold text-sm ${dailyGoal === g.value ? "text-blue-700" : "text-gray-900"}`}>
                          {dailyGoal === g.value ? "✓ " : ""}{g.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{g.desc}</p>
                      </div>
                      {dailyGoal === g.value && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </SelectCard>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl font-semibold text-sm hover:bg-gray-200 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={() => { saveOnboarding({ dailyGoal }); setStep(3); }}
                  className="flex-2 flex-grow-[2] bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-2xl font-bold text-sm hover:opacity-90 transition"
                >
                  Continue →
                </button>
              </div>
            </>
          )}

          {/* ── STEP 3: Learning reason ── */}
          {step === 3 && (
            <>
              <StepDots total={4} current={2} />
              <div className="text-center mb-2">
                <div className="text-4xl mb-2">💡</div>
                <h2 className="text-xl font-bold text-gray-900">Why are you learning?</h2>
                <p className="text-sm text-gray-500 mt-1">This helps us personalise your experience</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {LEARNING_REASONS.map((r) => (
                  <SelectCard
                    key={r.value}
                    selected={reason === r.value}
                    onClick={() => setReason(r.value)}
                  >
                    <div className="text-center py-1">
                      <div className="text-2xl mb-1">{r.icon}</div>
                      <p className={`text-xs font-semibold leading-tight ${reason === r.value ? "text-blue-700" : "text-gray-700"}`}>
                        {r.label}
                      </p>
                    </div>
                  </SelectCard>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setStep(2)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl font-semibold text-sm hover:bg-gray-200 transition">
                  ← Back
                </button>
                <button
                  onClick={() => { saveOnboarding({ learningReason: reason }); setStep(4); }}
                  disabled={!reason}
                  className="flex-grow-[2] bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-2xl font-bold text-sm hover:opacity-90 disabled:opacity-40 transition"
                >
                  Continue →
                </button>
              </div>
            </>
          )}

          {/* ── STEP 4: Experience level ── */}
          {step === 4 && (
            <>
              <StepDots total={4} current={3} />
              <div className="text-center mb-2">
                <div className="text-4xl mb-2">📊</div>
                <h2 className="text-xl font-bold text-gray-900">Haitian Creole experience?</h2>
                <p className="text-sm text-gray-500 mt-1">Be honest — we'll start you at the right level</p>
              </div>
              <div className="space-y-2">
                {EXPERIENCE_LEVELS.map((lvl) => (
                  <SelectCard
                    key={lvl.value}
                    selected={experience === lvl.value}
                    onClick={() => setExperience(lvl.value)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-bold text-sm ${experience === lvl.value ? "text-blue-700" : "text-gray-900"}`}>
                          {experience === lvl.value ? "✓ " : ""}{lvl.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{lvl.desc}</p>
                      </div>
                      {experience === lvl.value && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </SelectCard>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setStep(3)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl font-semibold text-sm hover:bg-gray-200 transition">
                  ← Back
                </button>
                <button
                  onClick={handleFinish}
                  disabled={!experience || loading}
                  className="flex-grow-[2] bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-2xl font-bold text-sm hover:opacity-90 disabled:opacity-40 transition"
                >
                  {loading ? "Saving..." : "Finish Setup 🎉"}
                </button>
              </div>
            </>
          )}

          {/* ── STEP 5: All done ── */}
          {step === 5 && (
            <div className="text-center space-y-4 py-4">
              <div className="text-6xl">🎉</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Ou pare, {name || "zanmi"}!</h2>
                <p className="text-gray-500 text-sm mt-1">
                  You're all set to start your Haitian Creole journey
                </p>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 text-left space-y-2 border border-blue-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Your profile</p>
                {[
                  { icon: "🌍", label: "Language", value: motherLanguage },
                  { icon: "🎯", label: "Daily goal", value: `${dailyGoal} min/day` },
                  { icon: "💡", label: "Learning for", value: LEARNING_REASONS.find(r => r.value === reason)?.label },
                  { icon: "📊", label: "Experience", value: EXPERIENCE_LEVELS.find(e => e.value === experience)?.label },
                ].map(({ icon, label, value }) => value ? (
                  <div key={label} className="flex items-center gap-2">
                    <span>{icon}</span>
                    <span className="text-xs text-gray-500">{label}:</span>
                    <span className="text-xs font-semibold text-gray-800">{value}</span>
                  </div>
                ) : null)}
              </div>

              {regType === "email" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3 text-sm text-yellow-800">
                  📧 Check your email to verify your account before you start!
                </div>
              )}

              <p className="text-xs text-gray-400">The app will load automatically…</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}