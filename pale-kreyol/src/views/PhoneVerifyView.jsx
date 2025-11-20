import React, { useState, useRef, useEffect } from "react";
import { sendPhoneCode } from "../firebase/authService.js";
import { updateUserProfile } from "../firebase/userService";
import { useAuth } from "../context/AuthContext";

// Simple Phone Icon
const PhoneIcon = (props) => (
  <svg {...props} width="20" height="20" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07
             19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18
             2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72
             c.12.88.37 1.75.72 2.56a2 2 0 0 1-.45 2.11L8 9
             s1.5 3 6 6l1.61-1.38a2 2 0 0 1 2.11-.45
             c.81.35 1.68.6 2.56.72A2 2 0 0 1 22 16.92z"/>
  </svg>
);

export default function PhoneVerifyView({ setCurrentView }) {
  const { user } = useAuth();

  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const [step, setStep] = useState("enter-phone");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [resendTimer, setResendTimer] = useState(0);

  // Countdown for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  // Format phone
  const formattedPhone = `${countryCode} ${phone}`;

  // INPUT HANDLERS ----------------------------------------
  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpBackspace = (index) => {
    if (otp[index] === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // SEND CODE ---------------------------------------------
  const handleSendCode = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const confirmationResult = await sendPhoneCode(`${countryCode}${phone}`);
      setConfirmation(confirmationResult);
      setStep("enter-code");
      setResendTimer(30);
      setSuccess("Verification code sent! Check your messages.");
    } catch (err) {
      setError(err.message || "Failed to send SMS code.");
    }

    setLoading(false);
  };

  // VERIFY CODE -------------------------------------------
  const handleVerify = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    const code = otp.join("");

    if (code.length !== 6) {
      setError("Enter all 6 digits.");
      setLoading(false);
      return;
    }

    try {
      await confirmation.confirm(code);

      setSuccess("Phone number verified successfully! 🎉");
      setStep("done");

      if (user) {
        await updateUserProfile(user.uid, { phone: `${countryCode}${phone}` });
      }
    } catch (err) {
      setError("Invalid verification code.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 animate-fade">

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Verify your phone
        </h2>

        <div id="recaptcha-container"></div>

        {/* STEP 1 — PHONE INPUT */}
        {step === "enter-phone" && (
          <div className="space-y-6">

            {/* Country */}
            <div>
              <label className="text-sm font-medium text-gray-600">Country</label>
              <select
                className="w-full mt-1 rounded-xl border px-4 py-3"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
              >
                <option value="+1">🇺🇸 +1 United States</option>
                <option value="+509">🇭🇹 +509 Haiti</option>
                <option value="+886">🇹🇼 +886 Taiwan</option>
                <option value="+33">🇫🇷 +33 France</option>
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-gray-600">Phone Number</label>
              <div className="flex items-center bg-gray-100 border rounded-xl px-4 py-3 mt-1">
                <PhoneIcon className="text-gray-400 mr-2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="812345678"
                  className="w-full bg-transparent focus:outline-none"
                />
              </div>
            </div>

            {error && <p className="text-red-600 bg-red-100 py-2 px-3 rounded">{error}</p>}
            {success && <p className="text-green-600 bg-green-100 py-2 px-3 rounded">{success}</p>}

            <button
              onClick={handleSendCode}
              disabled={!phone || loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold shadow hover:bg-blue-700"
            >
              {loading ? "Sending..." : "Send verification code"}
            </button>
          </div>
        )}

        {/* STEP 2 — CODE INPUT */}
        {step === "enter-code" && (
          <div className="space-y-6">

            <p className="text-center text-gray-600">
              Enter the 6-digit code sent to:
              <span className="font-semibold block text-gray-800">{formattedPhone}</span>
            </p>

            {/* OTP Boxes */}
            <div className="flex justify-between">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={digit}
                  ref={(el) => (inputRefs.current[index] = el)}
                  className="w-12 h-12 text-center text-xl border rounded-xl shadow-sm focus:border-blue-500"
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => e.key === "Backspace" && handleOtpBackspace(index)}
                />
              ))}
            </div>

            {error && <p className="text-red-600 bg-red-100 py-2 px-3 rounded">{error}</p>}
            {success && <p className="text-green-600 bg-green-100 py-2 px-3 rounded">{success}</p>}

            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold shadow hover:bg-green-700"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>

            {/* Resend */}
            <p className="text-center text-sm text-gray-600">
              Didn’t receive it?{" "}
              {resendTimer > 0 ? (
                <span className="font-semibold">Resend in {resendTimer}s</span>
              ) : (
                <button
                  onClick={handleSendCode}
                  className="text-blue-600 font-semibold"
                >
                  Resend
                </button>
              )}
            </p>
          </div>
        )}

        {/* STEP 3 — SUCCESS */}
        {step === "done" && (
          <div className="space-y-6 text-center">

            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                <svg
                  width="40"
                  height="40"
                  stroke="green"
                  strokeWidth="3"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h3 className="text-xl font-bold text-green-700">Phone Verified!</h3>

            <button
              onClick={() => setCurrentView("settings")}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold shadow hover:bg-blue-700"
            >
              Continue
            </button>
          </div>
        )}
      </div>

      {/* Animation */}
      <style>{`
        @keyframes fade {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade {
          animation: fade .4s ease-out;
        }
      `}</style>
    </div>
  );
}
