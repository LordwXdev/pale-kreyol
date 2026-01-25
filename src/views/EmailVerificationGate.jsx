// Replace the EmailVerificationGate function in App.jsx with this:

import { resendVerificationEmail } from "./firebase/authService";

function EmailVerificationGate({ children }) {
  const { user, logoutUser } = useAuth();
  const [sending, setSending] = useState(false);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [checkingVerification, setCheckingVerification] = useState(false);

  if (!user) return null;

  // Already verified → let them use the app
  if (user.emailVerified) {
    return children;
  }

  const handleResend = async () => {
    try {
      setSending(true);
      setInfo("");
      setError("");
      
      await resendVerificationEmail(user);
      setInfo("✓ Verification email sent! Check your inbox and spam folder.");
    } catch (err) {
      console.error("Error sending verification email:", err);
      
      if (err.message === "Email already verified") {
        setInfo("✓ Your email is already verified! Refreshing...");
        setTimeout(() => window.location.reload(), 1000);
      } else if (err.code === 'auth/too-many-requests') {
        setError("⚠️ Too many requests. Please wait a few minutes before trying again.");
      } else {
        setError(`❌ ${err.message || "Failed to send verification email. Please try again."}`);
      }
    } finally {
      setSending(false);
    }
  };

  const handleCheckVerification = async () => {
    try {
      setCheckingVerification(true);
      setError("");
      setInfo("");
      
      // Reload user from Firebase to get latest verification status
      await user.reload();
      
      if (user.emailVerified) {
        setInfo("✓ Email verified! Redirecting...");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setError("Email not verified yet. Please check your inbox and click the verification link.");
      }
    } catch (err) {
      console.error("Error checking verification:", err);
      setError("Error checking verification status. Please try again.");
    } finally {
      setCheckingVerification(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6 text-center">
        <div className="text-6xl mb-4">📧</div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">Verify your email</h2>
          <p className="text-sm text-gray-600">
            We sent a verification link to:
          </p>
          <p className="font-semibold text-gray-800 bg-gray-50 p-2 rounded-lg">
            {user.email}
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-left space-y-2">
          <p className="font-semibold text-blue-900">📝 What to do:</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-800">
            <li>Check your email inbox</li>
            <li>Look for an email from Firebase/noreply</li>
            <li>Click the verification link</li>
            <li>Come back here and click "I've verified"</li>
          </ol>
        </div>

        {info && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 p-3 rounded-lg">
            {info}
          </div>
        )}

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleCheckVerification}
            disabled={checkingVerification}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {checkingVerification ? "Checking..." : "✓ I've verified my email"}
          </button>

          <button
            onClick={handleResend}
            disabled={sending}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {sending ? "Sending..." : "📧 Resend verification email"}
          </button>

          <button
            onClick={logoutUser}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
          >
            Logout
          </button>
        </div>

        <div className="pt-4 border-t space-y-2">
          <p className="text-xs text-gray-500">
            💡 <strong>Not receiving emails?</strong>
          </p>
          <ul className="text-xs text-gray-500 text-left space-y-1">
            <li>• Check your spam/junk folder</li>
            <li>• Wait 2-3 minutes (emails can be delayed)</li>
            <li>• Make sure {user.email} is correct</li>
            <li>• Try resending the email</li>
          </ul>
        </div>
      </div>
    </div>
  );
}