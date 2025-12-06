import React, { useState, useEffect } from 'react';

// Pale Kreyòl Components
import Navigation from './components/Navigation.jsx';
import HomeView from './views/HomeView.jsx';
import LessonsView from './views/LessonsView.jsx';
import LessonView from './views/LessonView.jsx';
import QuizView from './views/QuizView.jsx';
import ProgressView from './views/ProgressView.jsx';
import SettingsView from './views/SettingsView.jsx';
import { lessons } from './data/lessons.js';

export default function App() {

  // -----------------------------------------------------------------------
  // 🔐 AUTHENTICATION HANDLING (ALL DONE THROUGH useAuth)
  // -----------------------------------------------------------------------

  const { user, profile, loading } = useAuth();

  // Screens shown BEFORE login
  const [authScreen, setAuthScreen] = useState("login");

  // Screens shown AFTER login
  const [appScreen, setAppScreen] = useState("learning");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  // ------------------ NOT LOGGED IN → show LOGIN / REGISTER ------------------
  if (!user) {
    if (authScreen === "register") {
      return (
        <RegisterView
          goLogin={() => setAuthScreen("login")}
        />
      );
    }

    if (authScreen === "forgot") {
      return (
        <ForgotPasswordView
          goLogin={() => setAuthScreen("login")}
        />
      );
    }

    return (
      <LoginView
        onSuccess={() => setAppScreen("learning")}
        goRegister={() => setAuthScreen("register")}
        goForgot={() => setAuthScreen("forgot")}
      />
    );
  }

  // ------------------ EMAIL NOT VERIFIED → gate the app ------------------
  return (
    <EmailVerificationGate>

      {/* ---------------------- APP AFTER LOGIN ---------------------- */}
      <MainLearningApp
        appScreen={appScreen}
        setAppScreen={setAppScreen}
        user={user}
        profile={profile}
      />

    </EmailVerificationGate>
  );
}


// ======================================================================
// 🎯 MAIN LEARNING APPLICATION (your Pale Kreyòl UI)
// ======================================================================
function MainLearningApp({ user, profile, appScreen, setAppScreen }) {

  // --------------------------- ORIGINAL STATES ---------------------------
  const [currentView, setCurrentView] = useState('home');
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [quizMode, setQuizMode] = useState(false);
  const [quizType, setQuizType] = useState(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [totalPoints, setTotalPoints] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [memoryCards, setMemoryCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(new Set());
  const [streak, setStreak] = useState(0);

  // --------------------------- SPEECH ---------------------------
  const speakWord = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  // ------------------------ SPEED QUIZ TIMER ------------------------
  useEffect(() => {
    if (quizType === 'speed' && quizMode && !answered && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (timeLeft === 0 && !answered && quizType === 'speed') {
      handleAnswer(null);
    }
  }, [timeLeft, quizMode, answered, quizType]);

  // -------------------------------------------------------------------
  // QUIZ FUNCTIONS (UNCHANGED FROM YOUR ORIGINAL CODE)
  // -------------------------------------------------------------------

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
    words.forEach(word => {
      cards.push({ id: `creole-${word.creole}`, text: word.creole, type: 'creole', match: word.english });
      cards.push({ id: `english-${word.english}`, text: word.english, type: 'english', match: word.creole });
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
      const card1 = memoryCards.find(c => c.id === newFlipped[0]);
      const card2 = memoryCards.find(c => c.id === newFlipped[1]);

      const match =
        (card1.type === "creole" && card2.text === card1.match) ||
        (card2.type === "creole" && card1.text === card2.match);

      if (match) {
        setMatchedPairs(new Set([...matchedPairs, card1.id, card2.id]));
        setScore(s => s + 1);
        setFlippedCards([]);

        if (matchedPairs.size + 2 === memoryCards.length)
          setTimeout(() => finishQuiz(), 500);

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
      setScore(s => s + 1);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentQuizIndex < selectedLesson.words.length - 1) {
      setCurrentQuizIndex(i => i + 1);
      setAnswered(false);
      setSelectedAnswer(null);
      setTimeLeft(10);
    } else {
      finishQuiz();
    }
  };

  // -------------------------------------------------------------------
  // 🔥 FINAL UPDATED finishQuiz() INCLUDING FIRESTORE SAVE
  // -------------------------------------------------------------------
  const finishQuiz = async () => {
    const points = score * (quizType === "speed" ? 15 : 10);

    // Save in Firestore
    await saveQuizProgress(user.uid, {
      lessonId: selectedLesson.id,
      xpEarned: points,
      streak
    });

    await saveQuizResult(user.uid, {
      lessonId: selectedLesson.id,
      quizType,
      score,
      totalQuestions: selectedLesson.words.length,
    });

    // Local updates
    setTotalPoints(prev => prev + points);
    setCompletedLessons(new Set([...completedLessons, selectedLesson.id]));
    setQuizMode(false);
    setCurrentView("lessons");
  };


  // -------------------------------------------------------------------
  // RESET LOCAL PROGRESS (NOT FIRESTORE)
  // -------------------------------------------------------------------
  const resetAll = () => {
    if (confirm("Reset all progress?")) {
      setCompletedLessons(new Set());
      setTotalPoints(0);
      setStreak(0);
    }
  };

  // -------------------------------------------------------------------
  // MAIN UI
  // -------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">

        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Pale Kreyòl
          </h1>
          <p className="text-gray-600 text-sm">Learn Haitian Creole with joy 🇭🇹</p>
        </div>

        {/* Main Views */}
        {!quizMode && currentView === 'home' &&
          <HomeView
            completedLessons={completedLessons}
            totalPoints={totalPoints}
            streak={streak}
            setSelectedLesson={setSelectedLesson}
            setCurrentView={setCurrentView}
            startQuiz={startQuiz}
          />
        }

        {!quizMode && currentView === 'lessons' &&
          <LessonsView
            completedLessons={completedLessons}
            setSelectedLesson={setSelectedLesson}
            setCurrentView={setCurrentView}
          />
        }

        {!quizMode && currentView === 'lesson' &&
          <LessonView
            selectedLesson={selectedLesson}
            setCurrentView={setCurrentView}
            speakWord={speakWord}
            startQuiz={startQuiz}
          />
        }

        {quizMode &&
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
        }

        {!quizMode && currentView === 'progress' &&
          <ProgressView
            totalPoints={totalPoints}
            completedCount={completedLessons.size}
            streak={streak}
          />
        }

        {!quizMode && currentView === 'settings' &&
          <SettingsView
            resetAll={resetAll}
            setAppScreen={setAppScreen}
          />
        }

      </div>

      <Navigation
        currentView={currentView}
        setCurrentView={setCurrentView}
        setQuizMode={setQuizMode}
      />
    </div>
  );
}
