// src/components/XPBar.jsx
import React from "react";
import { xpProgressPercent, xpToNextLevel, LEVEL_NAMES, calculateLevel } from "../firebase/UserService";

export default function XPBar({ xp = 0, compact = false }) {
  const level = calculateLevel(xp);
  const percent = xpProgressPercent(xp);
  const toNext = xpToNextLevel(xp);
  const levelName = LEVEL_NAMES[level] || "";

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
          Lv.{level}
        </span>
        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 font-medium">{xp.toLocaleString()} XP</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="font-bold text-gray-900">Level {level}</span>
          {levelName && (
            <span className="text-blue-500 text-sm ml-2 font-medium">{levelName}</span>
          )}
        </div>
        <span className="text-sm text-gray-500 font-medium">{xp.toLocaleString()} XP</span>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>
      {toNext > 0 && (
        <p className="text-xs text-gray-400 mt-1 text-right">{toNext} XP to next level</p>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// src/components/BadgeDisplay.jsx
// ─────────────────────────────────────────────────────────────────────────────
export function BadgeDisplay({ badges = [] }) {
  const { BADGE_DEFINITIONS } = require("../firebase/UserService"); // used as static import below

  if (!badges.length) {
    return <p className="text-sm text-gray-400 text-center py-4">No badges yet — keep learning! 🚀</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {badges.map((badgeId) => {
        const def = BADGE_DEFINITIONS[badgeId];
        if (!def) return null;
        return (
          <div key={badgeId} className="bg-white rounded-2xl p-3 text-center border border-yellow-100 shadow-sm">
            <div className="text-3xl mb-1">{def.icon}</div>
            <p className="text-xs font-bold text-gray-800">{def.name}</p>
            <p className="text-xs text-gray-400">{def.desc}</p>
          </div>
        );
      })}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// XP Notification overlay (add to main App)
// ─────────────────────────────────────────────────────────────────────────────
export function XPNotification({ amount, reason, visible }) {
  if (!visible) return null;
  return (
    <div className="fixed top-4 right-4 z-50 animate-bounce">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
        <span className="text-yellow-300 font-bold">+{amount} XP</span>
        <span className="text-sm opacity-90">{reason}</span>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// UPDATED src/App.jsx  — ONLY the changed sections shown
// Replace your entire App.jsx with this file
// ─────────────────────────────────────────────────────────────────────────────
/*
CHANGES vs your original App.jsx:
1. Import 4 new views: AITutorView, LeaderboardView, SubscriptionView, AdminView
2. Import XPNotification + XPBar
3. Pass `isAdmin` to Navigation
4. Add 4 new currentView cases in MainLearningApp
5. Add XP notification state + show overlay
6. Show XPBar at top of app
Everything else is IDENTICAL to your original.
*/

// PASTE THIS AS YOUR NEW src/App.jsx:

const NEW_APP_JSX = `
// src/App.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { auth, db } from "./firebase/config";

import { sendEmailVerification } from "firebase/auth";
import { saveQuizProgress, saveQuizResult } from "./firebase/UserService.js";
import { resendVerificationEmail } from "./firebase/authService";

import Navigation from "./components/Navigation.jsx";
import XPBar from "./components/XPBar.jsx";
import { XPNotification } from "./components/XPBar.jsx";

import HomeView from "./views/HomeView.jsx";
import LessonsView from "./views/LessonsView.jsx";
import LessonView from "./views/LessonView.jsx";
import QuizView from "./views/QuizView.jsx";
import ProgressView from "./views/ProgressView.jsx";
import SettingsView from "./views/SettingsView.jsx";
import DialogsView from "./views/DialogsView.jsx";
import DialogDetailView from "./views/DialogDetailView.jsx";
import GrammarView from "./views/GrammarView.jsx";

// ─── NEW VIEWS ───────────────────────────────────────────────
import AITutorView from "./views/AITutorView.jsx";
import LeaderboardView from "./views/LeaderboardView.jsx";
import { SubscriptionView } from "./views/LeaderboardView.jsx";
import { AdminView } from "./views/LeaderboardView.jsx";
// ─────────────────────────────────────────────────────────────

import { lessons } from "./data/lessons.js";
import LoginView from "./views/LoginView.jsx";
import RegisterView from "./views/RegisterView.jsx";
import ForgotPasswordView from "./views/ForgotPasswordView.jsx";
import VerifySuccessView from "./views/VerifySuccessView.jsx";

export default function App() {
  const { user, profile, loading } = useAuth();
  const [authScreen, setAuthScreen] = useState("login");
  const [appScreen, setAppScreen] = useState("learning");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

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

  if (window.location.pathname === "/verify") {
    return <VerifySuccessView />;
  }

  return (
    <MainLearningApp
      appScreen={appScreen}
      setAppScreen={setAppScreen}
      user={user}
      profile={profile}
    />
  );
}

function MainLearningApp({ user, profile, appScreen, setAppScreen }) {
  const { isAdmin } = useAuth();
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

  // ── NEW: XP notification state ────────────────────────────
  const [xpNotif, setXpNotif] = useState({ visible: false, amount: 0, reason: "" });
  const showXP = (amount, reason) => {
    setXpNotif({ visible: true, amount, reason });
    setTimeout(() => setXpNotif((n) => ({ ...n, visible: false })), 3000);
  };
  // ──────────────────────────────────────────────────────────

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
    if (!selectedLesson) setSelectedLesson(lessons[0]);
    if (type === "memory") initMemoryGame();
  };

  const initMemoryGame = () => {
    const words = selectedLesson.words.slice(0, 6);
    const cards = [];
    words.forEach((word) => {
      cards.push({ id: "creole-" + word.creole, text: word.creole, type: "creole", match: word.english });
      cards.push({ id: "english-" + word.english, text: word.english, type: "english", match: word.creole });
    });
    setMemoryCards(cards.sort(() => Math.random() - 0.5));
    setFlippedCards([]);
    setMatchedPairs(new Set());
  };

  const handleMemoryCardClick = (card) => {
    if (flippedCards.length === 2 || flippedCards.includes(card.id) || matchedPairs.has(card.id)) return;
    const newFlipped = [...flippedCards, card.id];
    setFlippedCards(newFlipped);
    if (newFlipped.length === 2) {
      const card1 = memoryCards.find((c) => c.id === newFlipped[0]);
      const card2 = memoryCards.find((c) => c.id === newFlipped[1]);
      const match = (card1.type === "creole" && card2.text === card1.match) || (card2.type === "creole" && card1.text === card2.match);
      if (match) {
        setMatchedPairs(new Set([...matchedPairs, card1.id, card2.id]));
        setScore((s) => s + 1);
        setFlippedCards([]);
        if (matchedPairs.size + 2 === memoryCards.length) setTimeout(() => finishQuiz(), 500);
      } else {
        setTimeout(() => setFlippedCards([]), 1000);
      }
    }
  };

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    setAnswered(true);
    const currentWord = selectedLesson.words[currentQuizIndex];
    const correct = quizType === "listen" ? answer === currentWord.creole : answer === currentWord.english;
    if (correct) { setScore((s) => s + 1); setStreak((s) => s + 1); }
    else { setStreak(0); }
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
      const result = await saveQuizProgress(user.uid, { lessonId: selectedLesson.id, xpEarned: points, streak });
      await saveQuizResult(user.uid, { lessonId: selectedLesson.id, quizType, score, totalQuestions: selectedLesson.words.length });
      
      // ── NEW: show XP notification ──
      showXP(points, "Quiz Complete!");
      
      // ── NEW: show badge notification ──
      if (result?.newBadges?.length > 0) {
        setTimeout(() => {
          result.newBadges.forEach((badge, i) => {
            setTimeout(() => showXP(0, badge.icon + " " + badge.name + " unlocked!"), i * 1500);
          });
        }, 1000);
      }
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
      {/* ── NEW: XP notification overlay ── */}
      <XPNotification amount={xpNotif.amount} reason={xpNotif.reason} visible={xpNotif.visible} />

      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Pale Kreyòl
              </h1>
              <p className="text-gray-600 text-sm">Learn Haitian Creole with joy 🇭🇹</p>
            </div>
            {/* ── NEW: compact XP bar in header ── */}
            {profile && <XPBar xp={profile.xp || 0} compact />}
          </div>
        </div>

        {/* ── ALL ORIGINAL VIEWS (unchanged) ── */}
        {!quizMode && currentView === "home" && (
          <HomeView completedLessons={completedLessons} totalPoints={profile?.xp ?? totalPoints} streak={profile?.streak ?? streak} setSelectedLesson={setSelectedLesson} setCurrentView={setCurrentView} startQuiz={startQuiz} />
        )}
        {!quizMode && currentView === "lessons" && (
          <LessonsView completedLessons={completedLessons} setSelectedLesson={setSelectedLesson} setCurrentView={setCurrentView} />
        )}
        {!quizMode && currentView === "lesson" && (
          <LessonView selectedLesson={selectedLesson} setCurrentView={setCurrentView} speakWord={speakWord} startQuiz={startQuiz} />
        )}
        {quizMode && (
          <QuizView quizType={quizType} selectedLesson={selectedLesson} currentQuizIndex={currentQuizIndex} answered={answered} selectedAnswer={selectedAnswer} score={score} timeLeft={timeLeft} streak={streak} setQuizMode={setQuizMode} setCurrentView={setCurrentView} handleAnswer={handleAnswer} handleNext={handleNext} memoryCards={memoryCards} flippedCards={flippedCards} handleMemoryCardClick={handleMemoryCardClick} matchedPairs={matchedPairs} />
        )}
        {!quizMode && currentView === "dialogs" && (
          <DialogsView completedDialogs={completedDialogs} setSelectedDialog={setSelectedDialog} setCurrentView={setCurrentView} />
        )}
        {!quizMode && currentView === "dialog" && selectedDialog && (
          <DialogDetailView selectedDialog={selectedDialog} setCurrentView={setCurrentView} completedDialogs={completedDialogs} setCompletedDialogs={setCompletedDialogs} speakWord={speakWord} />
        )}
        {!quizMode && currentView === "grammar" && selectedDialog && (
          <GrammarView selectedDialog={selectedDialog} setCurrentView={setCurrentView} />
        )}
        {!quizMode && currentView === "progress" && (
          <ProgressView totalPoints={profile?.xp ?? totalPoints} completedCount={completedLessons.size} streak={profile?.streak ?? streak} />
        )}
        {!quizMode && currentView === "settings" && (
          <SettingsView resetAll={resetAll} setAppScreen={setAppScreen} />
        )}

        {/* ── NEW VIEWS ── */}
        {!quizMode && currentView === "ai-tutor" && (
          <AITutorView setCurrentView={setCurrentView} />
        )}
        {!quizMode && currentView === "leaderboard" && (
          <LeaderboardView />
        )}
        {!quizMode && currentView === "subscription" && (
          <SubscriptionView setCurrentView={setCurrentView} />
        )}
        {!quizMode && currentView === "admin" && (
          <AdminView setCurrentView={setCurrentView} />
        )}
      </div>

      <Navigation
        currentView={currentView}
        setCurrentView={setCurrentView}
        setQuizMode={setQuizMode}
        isAdmin={isAdmin}
      />
    </div>
  );
}
`;
