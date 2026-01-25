// src/App.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { auth, db } from "./firebase/config";

// Firebase (for resend verification)
import { sendEmailVerification } from "firebase/auth";
import { saveQuizProgress, saveQuizResult } from "./firebase/UserService.js";
import { resendVerificationEmail } from "./firebase/authService";

// UI: Navigation + Learning Views
import Navigation from "./components/Navigation.jsx";
import HomeView from "./views/HomeView.jsx";
import LessonsView from "./views/LessonsView.jsx";
import LessonView from "./views/LessonView.jsx";
import QuizView from "./views/QuizView.jsx";
import ProgressView from "./views/ProgressView.jsx";
import SettingsView from "./views/SettingsView.jsx";
import DialogsView from "./views/DialogsView.jsx";
import DialogDetailView from "./views/DialogDetailView.jsx";
import GrammarView from "./views/GrammarView.jsx";
import { lessons } from "./data/lessons.js";

// Auth screens
import LoginView from "./views/LoginView.jsx";
import RegisterView from "./views/RegisterView.jsx";
import ForgotPasswordView from "./views/ForgotPasswordView.jsx";
import VerifySuccessView from "./views/VerifySuccessView.jsx";

// ---------------------------------------------------------------------
// MAIN APP
// ---------------------------------------------------------------------
export default function App() {
  const { user, profile, loading } = useAuth();

  // Which auth screen to show when user is NOT logged in
  const [authScreen, setAuthScreen] = useState("login");

  // Which general "mode" the app is in after login
  const [appScreen, setAppScreen] = useState("learning");

  // While Firebase is checking the existing session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  // -------------------------------------------------------------------
  // NOT LOGGED IN → show authentication screens
  // -------------------------------------------------------------------
  if (!user) {
    if (authScreen === "register") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
          <RegisterView goLogin={() => setAuthScreen("login")} />
        </div>
      );
    }

    if (authScreen === "forgot") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
          <ForgotPasswordView goLogin={() => setAuthScreen("login")} />
        </div>
      );
    }

    // default: login
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <LoginView
          onSuccess={() => setAppScreen("learning")}
          goRegister={() => setAuthScreen("register")}
          goForgot={() => setAuthScreen("forgot")}
        />
      </div>
    );
  }

  // -------------------------------------------------------------------
  // LOGGED IN → Handle verification success page
  // -------------------------------------------------------------------
  if (window.location.pathname === '/verify') {
    return <VerifySuccessView />;
  }

  // -------------------------------------------------------------------
  // LOGGED IN → gate app behind email verification
  // -------------------------------------------------------------------
  return (
    //<EmailVerificationGate>
      <MainLearningApp
        appScreen={appScreen}
        setAppScreen={setAppScreen}
        user={user}
        profile={profile}
      />
    //</EmailVerificationGate>
  );
}

// =====================================================================
// EMAIL VERIFICATION GATE
// =====================================================================
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

// =====================================================================
// MAIN LEARNING APPLICATION
// =====================================================================
function MainLearningApp({ user, profile, appScreen, setAppScreen }) {
  const [currentView, setCurrentView] = useState("home");
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedDialog, setSelectedDialog] = useState(null);
  const [quizMode, setQuizMode] = useState(false);
  const [quizType, setQuizType] = useState(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [completedDialogs, setCompletedDialogs] = useState(new Set());
  const [totalPoints, setTotalPoints] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [memoryCards, setMemoryCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(new Set());
  const [streak, setStreak] = useState(0);

  const speakWord = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "fr-FR";
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (quizType === "speed" && quizMode && !answered && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (timeLeft === 0 && !answered && quizType === "speed") {
      handleAnswer(null);
    }
  }, [timeLeft, quizMode, answered, quizType]);

  const startQuiz = (type) => {
    setQuizType(type);
    setQuizMode(true);
    setCurrentQuizIndex(0);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setTimeLeft(10);

    if (!selectedLesson) {
      setSelectedLesson(lessons[0]);
    }
    if (type === "memory") initMemoryGame();
  };

  const initMemoryGame = () => {
    const words = selectedLesson.words.slice(0, 6);
    const cards = [];
    words.forEach((word) => {
      cards.push({
        id: `creole-${word.creole}`,
        text: word.creole,
        type: "creole",
        match: word.english,
      });
      cards.push({
        id: `english-${word.english}`,
        text: word.english,
        type: "english",
        match: word.creole,
      });
    });
    setMemoryCards(cards.sort(() => Math.random() - 0.5));
    setFlippedCards([]);
    setMatchedPairs(new Set());
  };

  const handleMemoryCardClick = (card) => {
    if (
      flippedCards.length === 2 ||
      flippedCards.includes(card.id) ||
      matchedPairs.has(card.id)
    )
      return;

    const newFlipped = [...flippedCards, card.id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const card1 = memoryCards.find((c) => c.id === newFlipped[0]);
      const card2 = memoryCards.find((c) => c.id === newFlipped[1]);

      const match =
        (card1.type === "creole" && card2.text === card1.match) ||
        (card2.type === "creole" && card1.text === card2.match);

      if (match) {
        setMatchedPairs(new Set([...matchedPairs, card1.id, card2.id]));
        setScore((s) => s + 1);
        setFlippedCards([]);

        if (matchedPairs.size + 2 === memoryCards.length) {
          setTimeout(() => finishQuiz(), 500);
        }
      } else {
        setTimeout(() => setFlippedCards([]), 1000);
      }
    }
  };

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    setAnswered(true);

    const currentWord = selectedLesson.words[currentQuizIndex];
    const correct =
      quizType === "listen"
        ? answer === currentWord.creole
        : answer === currentWord.english;

    if (correct) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentQuizIndex < selectedLesson.words.length - 1) {
      setCurrentQuizIndex((i) => i + 1);
      setAnswered(false);
      setSelectedAnswer(null);
      setTimeLeft(10);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    const points = score * (quizType === "speed" ? 15 : 10);

    if (user) {
      await saveQuizProgress(user.uid, {
        lessonId: selectedLesson.id,
        xpEarned: points,
        streak,
      });

      await saveQuizResult(user.uid, {
        lessonId: selectedLesson.id,
        quizType,
        score,
        totalQuestions: selectedLesson.words.length,
      });
    }

    setTotalPoints((prev) => prev + points);
    setCompletedLessons(new Set([...completedLessons, selectedLesson.id]));
    setQuizMode(false);
    setCurrentView("lessons");
  };

  const resetAll = () => {
    if (confirm("Reset all local progress?")) {
      setCompletedLessons(new Set());
      setCompletedDialogs(new Set());
      setTotalPoints(0);
      setStreak(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Pale Kreyòl
          </h1>
          <p className="text-gray-600 text-sm">
            Learn Haitian Creole with joy 🇭🇹
          </p>
        </div>

        {!quizMode && currentView === "home" && (
          <HomeView
            completedLessons={completedLessons}
            totalPoints={totalPoints}
            streak={streak}
            setSelectedLesson={setSelectedLesson}
            setCurrentView={setCurrentView}
            startQuiz={startQuiz}
          />
        )}

        {!quizMode && currentView === "lessons" && (
          <LessonsView
            completedLessons={completedLessons}
            setSelectedLesson={setSelectedLesson}
            setCurrentView={setCurrentView}
          />
        )}

        {!quizMode && currentView === "lesson" && (
          <LessonView
            selectedLesson={selectedLesson}
            setCurrentView={setCurrentView}
            speakWord={speakWord}
            startQuiz={startQuiz}
          />
        )}

        {quizMode && (
          <QuizView
            quizType={quizType}
            selectedLesson={selectedLesson}
            currentQuizIndex={currentQuizIndex}
            answered={answered}
            selectedAnswer={selectedAnswer}
            score={score}
            timeLeft={timeLeft}
            streak={streak}
            setQuizMode={setQuizMode}
            setCurrentView={setCurrentView}
            handleAnswer={handleAnswer}
            handleNext={handleNext}
            memoryCards={memoryCards}
            flippedCards={flippedCards}
            handleMemoryCardClick={handleMemoryCardClick}
            matchedPairs={matchedPairs}
          />
        )}

        {!quizMode && currentView === "dialogs" && (
          <DialogsView
            completedDialogs={completedDialogs}
            setSelectedDialog={setSelectedDialog}
            setCurrentView={setCurrentView}
          />
        )}

        {!quizMode && currentView === "dialog" && selectedDialog && (
          <DialogDetailView
            selectedDialog={selectedDialog}
            setCurrentView={setCurrentView}
            completedDialogs={completedDialogs}
            setCompletedDialogs={setCompletedDialogs}
            speakWord={speakWord}
          />
        )}

        {!quizMode && currentView === "grammar" && selectedDialog && (
          <GrammarView
            selectedDialog={selectedDialog}
            setCurrentView={setCurrentView}
          />
        )}

        {!quizMode && currentView === "progress" && (
          <ProgressView
            totalPoints={totalPoints}
            completedCount={completedLessons.size}
            streak={streak}
          />
        )}

        {!quizMode && currentView === "settings" && (
          <SettingsView resetAll={resetAll} setAppScreen={setAppScreen} />
        )}
      </div>

      <Navigation
        currentView={currentView}
        setCurrentView={setCurrentView}
        setQuizMode={setQuizMode}
      />
    </div>
  );
}