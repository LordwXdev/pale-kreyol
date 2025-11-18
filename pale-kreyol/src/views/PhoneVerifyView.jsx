import React, { useState } from "react";
import { sendPhoneCode, verifyPhoneCode } from "../firebase/authService";

export default function PhoneVerifyView({ onDone }) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSendCode = async () => {
    try {
      setLoading(true);
      setError("");
      setMsg("");
      await sendPhoneCode(phone, "recaptcha-container");
      setStep(2);
      setMsg("Code sent. Check your SMS.");
    } catch (e) {
      setError(e.message || "Failed to send code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setLoading(true);
      setError("");
      setMsg("");
      await verifyPhoneCode(code);
      setMsg("Phone verified!");
      onDone && onDone();
    } catch (e) {
      setError(e.message || "Invalid code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 space-y-4">
      <div id="recaptcha-container" />
      <h2 className="text-2xl font-bold text-center">Verify phone number</h2>

      {step === 1 && (
        <>
          <input
            className="w-full border rounded-xl p-3"
            type="tel"
            placeholder="+1 555 555 5555"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
          />
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded-lg">
              {error}
            </div>
          )}
          {msg && (
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 p-2 rounded-lg">
              {msg}
            </div>
          )}
          <button
            onClick={handleSendCode}
            disabled={loading || !phone}
            className="w-full bg-blue-600 text-white py-3 rounded-xl"
          >
            {loading ? "Sending..." : "Send code"}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <input
            className="w-full border rounded-xl p-3"
            type="text"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={loading}
          />
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded-lg">
              {error}
            </div>
          )}
          {msg && (
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 p-2 rounded-lg">
              {msg}
            </div>
          )}
          <button
            onClick={handleVerify}
            disabled={loading || !code}
            className="w-full bg-green-600 text-white py-3 rounded-xl"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </>
      )}
    </div>
  );
}
