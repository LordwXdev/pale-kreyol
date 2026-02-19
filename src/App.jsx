// src/App.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";

import { saveQuizProgress, saveQuizResult, saveDialogProgress } from "./firebase/UserService.js";
import { resendVerificationEmail } from "./firebase/authService";

import Navigation from "./components/Navigation.jsx";
import XPBar, { XPNotification } from "./components/XPBar.jsx";
import LessonCompleteModal from "./components/LessonCompleteModal.jsx";

import HomeView from "./views/HomeView.jsx";
import LessonsView from "./views/LessonsView.jsx";
import LessonView from "./views/LessonView.jsx";
import QuizView from "./views/QuizView.jsx";
import ProgressView from "./views/ProgressView.jsx";
import SettingsView from "./views/SettingsView.jsx";
import DialogsView from "./views/DialogsView.jsx";
import DialogDetailView from "./views/DialogDetailView.jsx";
import GrammarView from "./views/GrammarView.jsx";
import AITutorView from "./views/AITutorView.jsx";
import { SubscriptionView, AdminView } from "./views/LeaderboardView.jsx";

import { lessons } from "./data/lessons.js";
import { dialogs } from "./data/dialogs.js";
import LoginView from "./views/LoginView.jsx";
import RegisterView from "./views/RegisterView.jsx";
import ForgotPasswordView from "./views/ForgotPasswordView.jsx";
import VerifySuccessView from "./views/VerifySuccessView.jsx";

export default function App() {
  const { user, profile, loading } = useAuth();
  const [authScreen, setAuthScreen] = useState("login");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!user) {
    if (authScreen === "register") return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <RegisterView goLogin={() => setAuthScreen("login")} />
      </div>
    );
    if (authScreen === "forgot") return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <ForgotPasswordView goLogin={() => setAuthScreen("login")} />
      </div>
    );
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <LoginView
          onSuccess={() => {}}
          goRegister={() => setAuthScreen("register")}
          goForgot={() => setAuthScreen("forgot")}
        />
      </div>
    );
  }

  if (window.location.pathname === "/verify") return <VerifySuccessView />;

  return <MainLearningApp user={user} profile={profile} />;
}

// ─────────────────────────────────────────────────────────────────────────────
function MainLearningApp({ user, profile }) {
  const { isAdmin } = useAuth();

  // ── Navigation ────────────────────────────────────────────────────
  const [currentView, setCurrentView] = useState("home");
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedDialog, setSelectedDialog] = useState(null);
  const [quizMode, setQuizMode] = useState(false);

  // ── Quiz state ────────────────────────────────────────────────────
  const [quizType, setQuizType] = useState(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [memoryCards, setMemoryCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(new Set());
  const [streak, setStreak] = useState(0);

  // ── Progress — synced FROM Firestore profile ──────────────────────
  // These are derived from profile (live Firestore) so they always stay
  // in sync across sessions and page refreshes.
  const completedLessons = new Set(profile?.completedLessons || []);
  const completedDialogs = new Set(profile?.completedDialogs || []);
  const totalPoints = profile?.xp || 0;
  const currentStreak = profile?.streak || 0;

  // ── Lesson complete modal ─────────────────────────────────────────
  const [modal, setModal] = useState(null);
  // modal shape: { lesson, xpEarned, score, totalQuestions, newBadges }

  // ── XP notification ───────────────────────────────────────────────
  const [xpNotif, setXpNotif] = useState({ visible: false, amount: 0, reason: "" });
  const showXP = (amount, reason) => {
    setXpNotif({ visible: true, amount, reason });
    setTimeout(() => setXpNotif((n) => ({ ...n, visible: false })), 3000);
  };

  // ── Speed quiz timer ──────────────────────────────────────────────
  useEffect(() => {
    if (quizType === "speed" && quizMode && !answered && timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
      return () => clearTimeout(t);
    }
    if (timeLeft === 0 && !answered && quizType === "speed") handleAnswer(null);
  }, [timeLeft, quizMode, answered, quizType]);

  // ── Start quiz ────────────────────────────────────────────────────
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
      cards.push({ id: `creole-${word.creole}`, text: word.creole, type: "creole", match: word.english });
      cards.push({ id: `english-${word.english}`, text: word.english, type: "english", match: word.creole });
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
      const c1 = memoryCards.find((c) => c.id === newFlipped[0]);
      const c2 = memoryCards.find((c) => c.id === newFlipped[1]);
      const match =
        (c1.type === "creole" && c2.text === c1.match) ||
        (c2.type === "creole" && c1.text === c2.match);
      if (match) {
        const next = new Set([...matchedPairs, c1.id, c2.id]);
        setMatchedPairs(next);
        setScore((s) => s + 1);
        setFlippedCards([]);
        if (next.size === memoryCards.length) setTimeout(() => finishQuiz(), 500);
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

  // ── Finish quiz — saves to Firestore + shows modal ────────────────
  const finishQuiz = async () => {
    const finalScore = quizType === "memory" ? memoryCards.length / 2 : score;
    const totalQ = quizType === "memory" ? memoryCards.length / 2 : selectedLesson.words.length;
    const xpEarned = finalScore * (quizType === "speed" ? 15 : 10);

    let newBadges = [];
    if (user) {
      try {
        // saveQuizProgress now writes completedLessons to Firestore via arrayUnion
        const result = await saveQuizProgress(user.uid, {
          lessonId: selectedLesson.id,
          xpEarned,
          streak,
        });
        await saveQuizResult(user.uid, {
          lessonId: selectedLesson.id,
          quizType,
          score: finalScore,
          totalQuestions: totalQ,
        });
        newBadges = result?.newBadges || [];
      } catch (e) {
        console.error("Error saving progress:", e);
      }
    }

    setQuizMode(false);

    // Show lesson complete modal
    setModal({
      lesson: selectedLesson,
      xpEarned,
      score: finalScore,
      totalQuestions: totalQ,
      newBadges,
    });
  };

  // ── Modal actions ─────────────────────────────────────────────────
  const handleModalContinue = () => {
    setModal(null);
    setCurrentView("lessons");
  };

  const handleModalPracticeDialog = () => {
    const lesson = modal?.lesson;
    setModal(null);
    if (!lesson) { setCurrentView("dialogs"); return; }
    const linked = dialogs.find((d) => d.lessonId === lesson.id);
    if (linked) {
      setSelectedDialog(linked);
      setCurrentView("dialog");
    } else {
      setCurrentView("dialogs");
    }
  };

  // ── Speech ────────────────────────────────────────────────────────
  const speakWord = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "fr-FR";
      u.rate = 0.8;
      window.speechSynthesis.speak(u);
    }
  };

  const resetAll = () => {
    if (confirm("Reset all progress? This cannot be undone.")) {
      const { resetUserProgress } = require("./firebase/UserService");
      resetUserProgress(user?.uid);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">

      {/* XP notification */}
      <XPNotification amount={xpNotif.amount} reason={xpNotif.reason} visible={xpNotif.visible} />

      {/* Lesson complete modal */}
      {modal && (
        <LessonCompleteModal
          lesson={modal.lesson}
          xpEarned={modal.xpEarned}
          score={modal.score}
          totalQuestions={modal.totalQuestions}
          newBadges={modal.newBadges}
          onContinue={handleModalContinue}
          onPracticeDialog={handleModalPracticeDialog}
          onClose={handleModalContinue}
        />
      )}

      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Pale Kreyòl
            </h1>
            <p className="text-gray-600 text-sm">Learn Haitian Creole with joy 🇭🇹</p>
          </div>
          {profile && <XPBar xp={profile.xp || 0} compact />}
        </div>

        {/* Views */}
        {!quizMode && currentView === "home" && (
          <HomeView
            completedLessons={completedLessons}
            totalPoints={totalPoints}
            streak={currentStreak}
            setSelectedLesson={setSelectedLesson}
            setCurrentView={setCurrentView}
            startQuiz={startQuiz}
          />
        )}

        {!quizMode && currentView === "lessons" && (
          <LessonsView
            completedLessons={completedLessons}
            completedDialogs={completedDialogs}
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
            completedLessons={completedLessons}
            setSelectedDialog={setSelectedDialog}
            setCurrentView={setCurrentView}
          />
        )}

        {!quizMode && currentView === "dialog" && selectedDialog && (
          <DialogDetailView
            selectedDialog={selectedDialog}
            setCurrentView={setCurrentView}
            completedDialogs={completedDialogs}
            setCompletedDialogs={() => {
              // Save dialog completion to Firestore
              if (user && selectedDialog) {
                saveDialogProgress(user.uid, selectedDialog.id);
              }
            }}
            speakWord={speakWord}
          />
        )}

        {!quizMode && currentView === "grammar" && selectedDialog && (
          <GrammarView selectedDialog={selectedDialog} setCurrentView={setCurrentView} />
        )}

        {!quizMode && currentView === "progress" && (
          <ProgressView
            totalPoints={totalPoints}
            completedCount={completedLessons.size}
            completedLessons={completedLessons}
            completedDialogs={completedDialogs}
            streak={currentStreak}
          />
        )}

        {!quizMode && currentView === "settings" && (
          <SettingsView resetAll={resetAll} setAppScreen={() => {}} />
        )}

        {!quizMode && currentView === "ai-tutor" && (
          <AITutorView setCurrentView={setCurrentView} />
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