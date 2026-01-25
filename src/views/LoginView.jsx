import React, { useState } from "react";
import { loginWithEmail, loginWithGoogle, setupRecaptcha, sendPhoneCode, verifyPhoneCode } from "../firebase/authService";

export default function LoginView({ onSuccess, goRegister, goForgot }) {
  const [loginMethod, setLoginMethod] = useState("email"); // "email" | "phone"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      await loginWithEmail(email.trim(), password, rememberMe);
      onSuccess();
    } catch (e) {
      console.error("Login error:", e);
      
      switch(e.code) {
        case 'auth/user-not-found':
          setError('No account found with this email. Please sign up first.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email format.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;
        default:
          setError(e.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      setError("");
      
      await loginWithGoogle(rememberMe);
      onSuccess();
    } catch (e) {
      console.error("Google login error:", e);
      
      if (e.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please try again.');
      } else if (e.code === 'auth/popup-blocked') {
        setError('Popup blocked. Please enable popups for this site.');
      } else {
        setError(e.message || "Google login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendPhoneCode = async () => {
    try {
      setLoading(true);
      setError("");

      // Validate phone number format (must include country code)
      if (!phoneNumber.startsWith('+')) {
        setError('Phone number must include country code (e.g., +1234567890)');
        return;
      }

      // Setup reCAPTCHA
      const recaptchaVerifier = setupRecaptcha("recaptcha-container");
      
      // Render reCAPTCHA
      await recaptchaVerifier.render();
      
      // Send verification code
      const confirmation = await sendPhoneCode(phoneNumber, recaptchaVerifier);
      setConfirmationResult(confirmation);
      setError("");
      
    } catch (e) {
      console.error("Phone verification error:", e);
      
      if (e.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number. Include country code (e.g., +1234567890)');
      } else if (e.code === 'auth/too-many-requests') {
        setError('Too many requests. Please try again later.');
      } else {
        setError(e.message || "Failed to send verification code.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      setLoading(true);
      setError("");

      await verifyPhoneCode(confirmationResult, verificationCode);
      onSuccess();
    } catch (e) {
      console.error("Code verification error:", e);
      
      if (e.code === 'auth/invalid-verification-code') {
        setError('Invalid verification code. Please try again.');
      } else {
        setError(e.message || "Verification failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 space-y-4">
      <h2 className="text-2xl font-bold text-center">Login</h2>

      {/* Login Method Toggle */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
        <button
          className={`flex-1 py-2 rounded-md transition ${
            loginMethod === "email" 
              ? "bg-white shadow-sm font-semibold" 
              : "text-gray-600"
          }`}
          onClick={() => {
            setLoginMethod("email");
            setError("");
          }}
        >
          Email
        </button>
        <button
          className={`flex-1 py-2 rounded-md transition ${
            loginMethod === "phone" 
              ? "bg-white shadow-sm font-semibold" 
              : "text-gray-600"
          }`}
          onClick={() => {
            setLoginMethod("phone");
            setError("");
          }}
        >
          Phone
        </button>
      </div>

      {/* EMAIL LOGIN */}
      {loginMethod === "email" && (
        <>
          <input
            type="email"
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <input
            type="password"
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            <label htmlFor="rememberMe" className="text-sm">Remember me</label>

            <button className="ml-auto text-blue-600 text-sm hover:underline" onClick={goForgot}>
              Forgot password?
            </button>
          </div>

          <button
            className="w-full bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading}
            onClick={handleLogin}
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </>
      )}

      {/* PHONE LOGIN */}
      {loginMethod === "phone" && (
        <>
          {!confirmationResult ? (
            <>
              <input
                type="tel"
                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1234567890 (with country code)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
              />
              
              <div id="recaptcha-container"></div>

              <button
                className="w-full bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={loading}
                onClick={handleSendPhoneCode}
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </button>
            </>
          ) : (
            <>
              <div className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg border border-green-200">
                ✓ Code sent to {phoneNumber}
              </div>

              <input
                type="text"
                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={loading}
                maxLength={6}
              />

              <button
                className="w-full bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={loading}
                onClick={handleVerifyCode}
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>

              <button
                className="w-full bg-gray-200 text-gray-700 p-3 rounded-xl hover:bg-gray-300 transition"
                onClick={() => {
                  setConfirmationResult(null);
                  setVerificationCode("");
                  setError("");
                }}
              >
                Change Phone Number
              </button>
            </>
          )}
        </>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Google Sign-in - Only show for email login */}
      {loginMethod === "email" && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            className="w-full bg-white border-2 border-gray-300 text-gray-700 p-3 rounded-xl hover:bg-gray-50 transition disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={loading}
            onClick={handleGoogle}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </>
      )}

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <button className="text-blue-600 hover:underline font-semibold" onClick={goRegister}>
          Sign up
        </button>
      </p>
    </div>
  );
}