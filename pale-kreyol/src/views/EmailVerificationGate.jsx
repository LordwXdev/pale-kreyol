import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function EmailVerificationGate({ children }) {
  const { user } = useAuth();
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  if (!user) return null;

  const refresh = async () => {
    try {
      setChecking(true);
      setError("");
      await user.reload();
    } catch (e) {
      setError(e.message || "Failed to refresh status.");
    } finally {
      setChecking(false);
    }
  };

  if (!user.emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 space-y-4">
          <h2 className="text-2xl font-bold text-center">Verify your email</h2>
          <p className="text-sm text-gray-700 text-center">
            We sent a verification link to:
            <br />
            <span className="font-semibold">{user.email}</span>
          </p>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded-lg">
              {error}
            </div>
          )}
          <button
            onClick={refresh}
            disabled={checking}
            className="w-full bg-blue-600 text-white py-3 rounded-xl"
          >
            {checking ? "Checking..." : "I verified my email"}
          </button>
        </div>
      </div>
    );
  }

  return children;
}
