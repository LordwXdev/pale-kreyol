import React from "react";

export default function VerifySuccessView() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-4">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-green-600">Email Verified!</h1>
        <p className="text-gray-600">
          Your email has been successfully verified.
        </p>
        <p className="text-sm text-gray-500">
          You can close this page and return to the app.
        </p>
        <button
          onClick={() => {
            window.close();
            // If window.close() doesn't work, redirect to app
            setTimeout(() => {
              window.location.href = '/';
            }, 500);
          }}
          className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          Close this tab
        </button>
      </div>
    </div>
  );
}