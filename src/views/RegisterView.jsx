import React, { useState } from "react";
import { registerWithEmail, setupRecaptcha, sendPhoneCode, verifyPhoneCode } from "../firebase/authService";

export default function RegisterView({ goLogin }) {
  const [registrationType, setRegistrationType] = useState("email"); // 'email' or 'phone'
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [codeSent, setCodeSent] = useState(false);

  const handleEmailRegister = async () => {
    try {
      setLoading(true);
      setError("");
      setMsg("");

      await registerWithEmail(email, password);
      setMsg("Account created! Please check your email to verify your account.");
    } catch (e) {
      setError(e.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneCode = async () => {
    try {
      setLoading(true);
      setError("");
      setMsg("");

      // Setup reCAPTCHA
      const recaptchaVerifier = setupRecaptcha("recaptcha-container");
      
      // Send SMS code
      const confirmation = await sendPhoneCode(phone, recaptchaVerifier);
      setConfirmationResult(confirmation);
      setCodeSent(true);
      setMsg("Verification code sent to your phone!");
    } catch (e) {
      setError(e.message || "Failed to send verification code.");
      // Reset reCAPTCHA on error
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhoneCode = async () => {
    try {
      setLoading(true);
      setError("");
      setMsg("");

      await verifyPhoneCode(confirmationResult, verificationCode);
      setMsg("Phone verified! Redirecting...");
      setTimeout(() => window.location.reload(), 1000);
    } catch (e) {
      setError(e.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 space-y-4">
      <h2 className="text-2xl font-bold text-center">Create Account</h2>

      {/* Registration Type Selector */}
      {!codeSent && (
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setRegistrationType("email")}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              registrationType === "email"
                ? "bg-white text-blue-600 shadow"
                : "text-gray-600"
            }`}
          >
            📧 Email
          </button>
          <button
            onClick={() => setRegistrationType("phone")}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              registrationType === "phone"
                ? "bg-white text-blue-600 shadow"
                : "text-gray-600"
            }`}
          >
            📱 Phone
          </button>
        </div>
      )}

      {/* Email Registration */}
      {registrationType === "email" && !codeSent && (
        <>
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
        </>
      )}

      {/* Phone Registration - Step 1: Enter Phone */}
      {registrationType === "phone" && !codeSent && (
        <>
          <input
            type="tel"
            className="w-full p-3 border rounded-xl"
            placeholder="Phone number (e.g., +15551234567)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
          />
          <p className="text-xs text-gray-500">
            Include country code (e.g., +1 for US, +509 for Haiti)
          </p>
          
          {/* reCAPTCHA container */}
          <div id="recaptcha-container"></div>
        </>
      )}

      {/* Phone Registration - Step 2: Enter Code */}
      {registrationType === "phone" && codeSent && (
        <>
          <div className="text-center">
            <p className="text-sm text-gray-600">Enter the 6-digit code sent to:</p>
            <p className="font-semibold">{phone}</p>
          </div>
          
          <input
            type="text"
            className="w-full p-3 border rounded-xl text-center text-2xl tracking-widest"
            placeholder="000000"
            maxLength="6"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            disabled={loading}
          />
        </>
      )}

      {msg && (
        <div className="text-sm bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg">
          {msg}
        </div>
      )}

      {error && (
        <div className="text-sm bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      {!codeSent && (
        <button
          onClick={registrationType === "email" ? handleEmailRegister : handleSendPhoneCode}
          disabled={
            loading ||
            (registrationType === "email" && (!email || password.length < 6)) ||
            (registrationType === "phone" && !phone)
          }
          className="w-full bg-green-600 text-white py-3 rounded-xl disabled:bg-gray-300"
        >
          {loading ? "Processing..." : registrationType === "email" ? "Sign Up" : "Send Code"}
        </button>
      )}

      {codeSent && (
        <>
          <button
            onClick={handleVerifyPhoneCode}
            disabled={loading || verificationCode.length !== 6}
            className="w-full bg-green-600 text-white py-3 rounded-xl disabled:bg-gray-300"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
          
          <button
            onClick={() => {
              setCodeSent(false);
              setVerificationCode("");
              setError("");
              setMsg("");
            }}
            className="w-full bg-gray-200 text-gray-700 py-2 rounded-xl"
          >
            Change Phone Number
          </button>
        </>
      )}

      <p className="text-sm text-center">
        Already have an account?{" "}
        <button className="text-blue-600" onClick={goLogin}>
          Login
        </button>
      </p>
    </div>
  );
}