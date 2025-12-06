import React from 'react';
import { X, Check, Volume2, Zap } from 'lucide-react';
import { lessons } from '../data/lessons.js';

// Tailwind JIT needs static class names (no "hover:border-${scheme}-500")
const schemeClasses = {
  blue: 'hover:border-blue-500 hover:bg-blue-50',
  purple: 'hover:border-purple-500 hover:bg-purple-50',
  yellow: 'hover:border-yellow-500 hover:bg-yellow-50',
};

function OptionsList({ options, correctValue, selectedAnswer, answered, onClick, scheme }) {
  return (
    <div className="space-y-3">
      {options.map((option, index) => (
        <button
          key={index}
          onClick={() => !answered && onClick(option)}
          disabled={answered}
          className={`w-full p-4 rounded-xl font-medium text-left transition-all ${
            answered
              ? option === correctValue
                ? 'bg-green-100 border-2 border-green-500 text-green-700'
                : option === selectedAnswer
                ? 'bg-red-100 border-2 border-red-500 text-red-700'
                : 'bg-gray-100 text-gray-500'
              : `bg-white border-2 border-gray-200 ${schemeClasses[scheme]}`
          }`}
        >
          <div className="flex items-center justify-between">
            <span>{option}</span>
            {answered && option === correctValue && <Check className="text-green-600" size={20} />}
            {answered && option === selectedAnswer && option !== correctValue && (
              <X className="text-red-600" size={20} />
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

export default function QuizView({
  quizType,
  selectedLesson,
  currentQuizIndex,
  answered,
  selectedAnswer,
  score,
  timeLeft,
  streak,
  setQuizMode,
  setCurrentView,
  handleAnswer,
  handleNext,
  memoryCards,
  flippedCards,
  handleMemoryCardClick,
  matchedPairs
}) {
  if (!selectedLesson) return null;

  const currentWord = selectedLesson.words[currentQuizIndex];
  const allWords = lessons.flatMap(l => l.words);

  const translateOptions = React.useMemo(
    () =>
      [
        currentWord.english,
        ...allWords
          .filter(w => w.english !== currentWord.english)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(w => w.english)
      ].sort(() => Math.random() - 0.5),
    [currentWord, allWords]
  );

  const listenOptions = React.useMemo(
    () =>
      [
        currentWord.creole,
        ...allWords
          .filter(w => w.creole !== currentWord.creole)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(w => w.creole)
      ].sort(() => Math.random() - 0.5),
    [currentWord, allWords]
  );

  const speedOptions = translateOptions;

  const speakWord = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const Header = () => (
    <div className="flex items-center justify-between">
      <button
        onClick={() => {
          setQuizMode(false);
          setCurrentView('lesson');
        }}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <X size={24} />
      </button>
      <h2 className="text-xl font-bold">
        {quizType === 'translate'
          ? 'Translation'
          : quizType === 'listen'
          ? 'Listening'
          : quizType === 'speed'
          ? 'Speed Round'
          : 'Memory Match'}
      </h2>
      {quizType !== 'memory' && (
        <div className="text-sm font-semibold text-gray-600">
          {currentQuizIndex + 1} / {selectedLesson.words.length}
        </div>
      )}
    </div>
  );
  if (quizType === 'memory') {
    return (
      <div className="space-y-4 animate-fade-in">
        <Header />
        <div className="bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl p-6 text-center">
          <h3 className="text-2xl font-bold text-green-600 mb-2">Memory Match</h3>
          <p className="text-sm text-gray-600">Match Creole words with English translations</p>
          <div className="mt-3 text-lg font-semibold text-green-700">
            Matches: {matchedPairs.size / 2} / {memoryCards.length / 2}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {memoryCards.map((card, index) => {
            const isFlipped = flippedCards.includes(card.id) || matchedPairs.has(card.id);
            const isMatched = matchedPairs.has(card.id);
            return (
              <button
                key={index}
                onClick={() => handleMemoryCardClick(card)}
                disabled={isMatched}
                className={`aspect-square rounded-xl p-3 font-semibold text-sm transition-all transform ${
                  isMatched
                    ? 'bg-green-100 border-2 border-green-500 text-green-700'
                    : isFlipped
                    ? card.type === 'creole'
                      ? 'bg-blue-100 border-2 border-blue-500 text-blue-700'
                      : 'bg-purple-100 border-2 border-purple-500 text-purple-700'
                    : 'bg-gray-200 hover:bg-gray-300 active:scale-95'
                }`}
              >
                {isFlipped ? card.text : '?'}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Header />

      {quizType === 'translate' && (
        <>
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8 text-center">
            <p className="text-sm text-gray-600 mb-2">Translate this word:</p>
            <h3 className="text-4xl font-bold text-blue-600 mb-3">{currentWord.creole}</h3>
            <button
              onClick={() => speakWord(currentWord.creole)}
              className="bg-white p-3 rounded-full hover:bg-gray-50 transition-colors"
            >
              <Volume2 className="text-blue-600" size={24} />
            </button>
          </div>
          <OptionsList
            options={translateOptions}
            correctValue={currentWord.english}
            selectedAnswer={selectedAnswer}
            answered={answered}
            onClick={(opt) => handleAnswer(opt)}
            scheme="blue"
          />
        </>
      )}

      {quizType === 'listen' && (
        <>
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8 text-center">
            <p className="text-sm text-gray-600 mb-4">Listen and select the correct word:</p>
            <h3 className="text-3xl font-bold text-purple-600 mb-3">{currentWord.english}</h3>
            <button
              onClick={() => speakWord(currentWord.creole)}
              className="bg-white p-4 rounded-full hover:bg-gray-50 transition-colors"
            >
              <Volume2 className="text-purple-600" size={32} />
            </button>
            <p className="text-xs text-gray-500 mt-3">Tap to hear pronunciation</p>
          </div>
          <OptionsList
            options={listenOptions}
            correctValue={currentWord.creole}
            selectedAnswer={selectedAnswer}
            answered={answered}
            onClick={(opt) => handleAnswer(opt)}
            scheme="purple"
          />
        </>
      )}

      {quizType === 'speed' && (
        <>
          <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl p-6 text-center relative">
            <div className="absolute top-4 right-4">
              <div className={`text-3xl font-bold ${timeLeft <= 3 ? 'text-red-600 animate-pulse' : 'text-yellow-600'}`}>
                {timeLeft}s
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">Quick! Translate:</p>
            <h3 className="text-4xl font-bold text-yellow-600 mb-3">{currentWord.creole}</h3>
            <div className="flex items-center justify-center gap-2">
              <Zap className="text-yellow-500" size={20} />
              <span className="text-sm text-gray-600">Speed Round</span>
            </div>
          </div>
          <OptionsList
            options={speedOptions}
            correctValue={currentWord.english}
            selectedAnswer={selectedAnswer}
            answered={answered}
            onClick={(opt) => handleAnswer(opt)}
            scheme="yellow"
          />
        </>
      )}

      {quizType !== 'memory' && answered && (
        <button
          onClick={handleNext}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors"
        >
          {currentQuizIndex < selectedLesson.words.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </button>
      )}

      {quizType !== 'memory' && (
        <div className="text-center space-y-2">
          <div className="text-sm text-gray-600">Score: {score} / {selectedLesson.words.length}</div>
          {streak > 0 && (
            <div className="flex items-center justify-center gap-2 text-orange-600">
              <Zap size={16} />
              <span className="text-sm font-semibold">{streak} streak!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
