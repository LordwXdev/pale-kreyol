import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation.jsx';
import HomeView from './views/HomeView.jsx';
import LessonsView from './views/LessonsView.jsx';
import LessonView from './views/LessonView.jsx';
import QuizView from './views/QuizView.jsx';
import ProgressView from './views/ProgressView.jsx';
import SettingsView from './views/SettingsView.jsx';
import { lessons } from './data/lessons.js';
import LoginView from "./views/LoginView.jsx";
import RegisterView from "./views/RegisterView.jsx";
import { auth } from "./firebase/config";
import { onAuthStateChanged } from "firebase/auth";


export default function App() {
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
  

  const speakWord = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (quizType === 'speed' && quizMode && !answered && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !answered && quizType === 'speed') {
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
    if (type === 'memory') initMemoryGame();
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
      if ((card1.type === 'creole' && card2.text === card1.match) || (card2.type === 'creole' && card1.text === card2.match)) {
        setMatchedPairs(new Set([...matchedPairs, card1.id, card2.id]));
        setScore((s)=>s+1);
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
    const correct = (quizType === 'listen') ? answer === currentWord.creole : answer === currentWord.english;
    if (correct) { setScore((s)=>s+1); setStreak((st)=>st+1); } else { setStreak(0); }
  };

  const handleNext = () => {
    if (currentQuizIndex < selectedLesson.words.length - 1) {
      setCurrentQuizIndex((i)=>i+1);
      setAnswered(false);
      setSelectedAnswer(null);
      setTimeLeft(10);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const points = score * (quizType === 'speed' ? 15 : 10);
    setTotalPoints((p)=>p+points);
    setCompletedLessons(new Set([...completedLessons, selectedLesson.id]));
    setQuizMode(false);
    setCurrentView('lessons');
  };

  const resetAll = () => {
    if (confirm('Are you sure you want to reset all progress?')) {
      setCompletedLessons(new Set());
      setTotalPoints(0);
      setStreak(0);
    }
  };
  const [user, setUser] = useState(null);

useEffect(() => {
  onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
  });
}, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Pale Kreyòl</h1>
          <p className="text-gray-600 text-sm">Learn Haitian Creole with joy 🇭🇹</p>
        </div>

        {!quizMode && currentView === 'home' && (
          <HomeView
            completedLessons={completedLessons}
            totalPoints={totalPoints}
            streak={streak}
            setSelectedLesson={setSelectedLesson}
            setCurrentView={setCurrentView}
            startQuiz={startQuiz}
          />
        )}
        {!quizMode && currentView === 'lessons' && (
          <LessonsView
            completedLessons={completedLessons}
            setSelectedLesson={setSelectedLesson}
            setCurrentView={setCurrentView}
          />
        )}
        {!quizMode && currentView === 'lesson' && (
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
        {!quizMode && currentView === 'progress' && (
          <ProgressView totalPoints={totalPoints} completedCount={completedLessons.size} streak={streak} />
        )}
        {!quizMode && currentView === 'settings' && <SettingsView resetAll={resetAll} />}
      </div>

      <Navigation currentView={currentView} setCurrentView={setCurrentView} setQuizMode={setQuizMode} />
    </div>
  );
}
