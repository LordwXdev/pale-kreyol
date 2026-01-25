// src/views/DialogDetailView.jsx
import React, { useState } from "react";

export default function DialogDetailView({ 
  selectedDialog, 
  setCurrentView,
  completedDialogs,
  setCompletedDialogs,
  speakWord 
}) {
  const [step, setStep] = useState(1); // 1: Read, 2: Exercise, 3: Quiz, 4: Pronunciation, 5: Vocabulary
  const [showTranslation, setShowTranslation] = useState(true);
  
  // Exercise state
  const [currentExercise, setCurrentExercise] = useState(0);
  const [exerciseAnswers, setExerciseAnswers] = useState({});
  const [exerciseScore, setExerciseScore] = useState(null);
  
  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizScore, setQuizScore] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  
  // Pronunciation state
  const [pronunciationProgress, setPronunciationProgress] = useState(new Set());

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  // Mark dialog as completed
  const markCompleted = () => {
    const newCompleted = new Set(completedDialogs);
    newCompleted.add(selectedDialog.id);
    setCompletedDialogs(newCompleted);
  };

  // STEP 1: Read Dialog
  const renderReadDialog = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">📖 Read the Conversation</h3>
        <button
          onClick={() => setShowTranslation(!showTranslation)}
          className="text-sm bg-gray-200 px-3 py-1 rounded-lg hover:bg-gray-300"
        >
          {showTranslation ? "Hide" : "Show"} Translation
        </button>
      </div>

      <div className="space-y-3">
        {selectedDialog.conversation.map((line, index) => {
          const character = selectedDialog.characters.find(c => c.name === line.speaker);
          
          return (
            <div key={index} className="bg-white rounded-xl p-4 shadow">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{character?.avatar}</span>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 mb-1">
                    {line.speaker}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-medium text-blue-700">
                        {line.creole}
                      </p>
                      <button
                        onClick={() => speakWord(line.creole)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        🔊
                      </button>
                    </div>
                    
                    {showTranslation && (
                      <>
                        <p className="text-gray-700">{line.english}</p>
                        <p className="text-sm text-gray-500 italic">
                          {line.pronunciation}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setStep(2)}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
      >
        Continue to Exercises →
      </button>
    </div>
  );

  // STEP 2: Exercises
  const renderExercises = () => {
    const exercise = selectedDialog.exercises[currentExercise];
    
    if (exercise.type === "fill-blank") {
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">✏️ {exercise.instruction}</h3>
          
          <div className="space-y-3">
            {exercise.questions.map((q, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow">
                <p className="mb-2 font-medium">{q.creole}</p>
                <p className="text-sm text-gray-600 mb-3">{q.translation}</p>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg"
                  placeholder="Your answer..."
                  value={exerciseAnswers[i] || ""}
                  onChange={(e) => setExerciseAnswers({
                    ...exerciseAnswers,
                    [i]: e.target.value
                  })}
                  disabled={exerciseScore !== null}
                />
                {exerciseScore !== null && (
                  <div className={`mt-2 text-sm ${
                    exerciseAnswers[i]?.toLowerCase() === q.answer.toLowerCase()
                      ? "text-green-600"
                      : "text-red-600"
                  }`}>
                    {exerciseAnswers[i]?.toLowerCase() === q.answer.toLowerCase()
                      ? "✓ Correct!"
                      : `✗ Correct answer: ${q.answer}`
                    }
                  </div>
                )}
              </div>
            ))}
          </div>

          {exerciseScore === null ? (
            <button
              onClick={() => {
                const correct = exercise.questions.filter((q, i) => 
                  exerciseAnswers[i]?.toLowerCase() === q.answer.toLowerCase()
                ).length;
                setExerciseScore(correct);
              }}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700"
            >
              Check Answers
            </button>
          ) : (
            <div className="space-y-2">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="font-bold text-lg">
                  Score: {exerciseScore}/{exercise.questions.length}
                </p>
              </div>
              <button
                onClick={() => setStep(3)}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
              >
                Continue to Quiz →
              </button>
            </div>
          )}
        </div>
      );
    }

    if (exercise.type === "match-pairs") {
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">🔗 {exercise.instruction}</h3>
          
          <div className="grid grid-cols-2 gap-3">
            {exercise.pairs.map((pair, i) => (
              <React.Fragment key={i}>
                <div className="bg-blue-50 p-3 rounded-lg font-medium text-center">
                  {pair.creole}
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  {pair.english}
                </div>
              </React.Fragment>
            ))}
          </div>

          <button
            onClick={() => setStep(3)}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
          >
            Continue to Quiz →
          </button>
        </div>
      );
    }
  };

  // STEP 3: Comprehension Quiz
  const renderQuiz = () => {
    const question = selectedDialog.comprehensionQuestions[currentQuestion];
    const isAnswered = selectedAnswer !== null;
    const isCorrect = selectedAnswer === question.correct;

    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold">❓ Comprehension Quiz</h3>
        
        <div className="bg-white rounded-xl p-4 shadow">
          <div className="mb-2 text-sm text-gray-500">
            Question {currentQuestion + 1} of {selectedDialog.comprehensionQuestions.length}
          </div>
          
          <p className="text-lg font-medium mb-1">{question.question}</p>
          <p className="text-sm text-gray-600 mb-4">{question.translation}</p>
          
          <div className="space-y-2">
            {question.options.map((option, i) => (
              <button
                key={i}
                onClick={() => !isAnswered && setSelectedAnswer(option)}
                disabled={isAnswered}
                className={`w-full p-3 rounded-lg text-left transition ${
                  isAnswered
                    ? option === question.correct
                      ? "bg-green-100 border-2 border-green-500"
                      : option === selectedAnswer
                      ? "bg-red-100 border-2 border-red-500"
                      : "bg-gray-100"
                    : "bg-gray-50 hover:bg-blue-50 border-2 border-transparent"
                }`}
              >
                {option}
                {isAnswered && option === question.correct && " ✓"}
                {isAnswered && option === selectedAnswer && option !== question.correct && " ✗"}
              </button>
            ))}
          </div>
        </div>

        {isAnswered && (
          <div className={`p-4 rounded-xl ${
            isCorrect ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}>
            {isCorrect ? "✓ Correct!" : `✗ The correct answer is: ${question.correct}`}
          </div>
        )}

        {isAnswered && (
          <button
            onClick={() => {
              const newAnswers = [...quizAnswers, isCorrect ? 1 : 0];
              setQuizAnswers(newAnswers);
              
              if (currentQuestion < selectedDialog.comprehensionQuestions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
                setSelectedAnswer(null);
              } else {
                const score = newAnswers.reduce((a, b) => a + b, 0);
                setQuizScore(score);
                setStep(4);
              }
            }}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
          >
            {currentQuestion < selectedDialog.comprehensionQuestions.length - 1 
              ? "Next Question →" 
              : "Continue to Pronunciation →"
            }
          </button>
        )}
      </div>
    );
  };

  // STEP 4: Pronunciation Practice
  const renderPronunciation = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">🗣️ Pronunciation Practice</h3>
      
      <div className="space-y-3">
        {selectedDialog.pronunciationPractice.map((item, i) => {
          const practiced = pronunciationProgress.has(i);
          
          return (
            <div key={i} className="bg-white rounded-xl p-4 shadow">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => {
                    speakWord(item.phrase);
                    const newProgress = new Set(pronunciationProgress);
                    newProgress.add(i);
                    setPronunciationProgress(newProgress);
                  }}
                  className="text-3xl hover:scale-110 transition"
                >
                  🔊
                </button>
                <div className="flex-1">
                  <p className="font-medium text-blue-700">{item.phrase}</p>
                  <p className="text-sm text-gray-600">{item.translation}</p>
                </div>
                {practiced && <span className="text-green-500 text-xl">✓</span>}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setStep(5)}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
      >
        Continue to Vocabulary →
      </button>
    </div>
  );

  // STEP 5: Vocabulary Review
  const renderVocabulary = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">📚 Vocabulary Review</h3>
      
      <div className="space-y-3">
        {selectedDialog.vocabulary.map((word, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow">
            <div className="flex items-center gap-3">
              <button
                onClick={() => speakWord(word.creole)}
                className="text-2xl hover:scale-110 transition"
              >
                🔊
              </button>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-bold text-blue-700 text-lg">{word.creole}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-700">{word.english}</span>
                </div>
                <p className="text-sm text-gray-500 italic">{word.pronunciation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-3">
        <p className="text-4xl">🎉</p>
        <h4 className="text-xl font-bold text-green-800">Dialog Completed!</h4>
        {quizScore !== null && (
          <p className="text-green-700">
            Quiz Score: {quizScore}/{selectedDialog.comprehensionQuestions.length}
          </p>
        )}
      </div>

      <button
        onClick={() => {
          markCompleted();
          setCurrentView("dialogs");
        }}
        className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700"
      >
        ✓ Finish & Return to Dialogs
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (step > 1) setStep(step - 1);
            else setCurrentView("dialogs");
          }}
          className="text-2xl hover:scale-110 transition"
        >
          ←
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold">{selectedDialog.title}</h2>
          <p className="text-sm text-gray-600">{selectedDialog.description}</p>
        </div>
        {selectedDialog.grammar && selectedDialog.grammar.length > 0 && (
          <button
            onClick={() => setCurrentView("grammar")}
            className="bg-purple-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-purple-700 transition text-sm"
          >
            📚 Grammar
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl p-4 shadow">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Progress</span>
          <span className="font-semibold">Step {step} of {totalSteps}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>📖 Read</span>
          <span>✏️ Exercise</span>
          <span>❓ Quiz</span>
          <span>🗣️ Speak</span>
          <span>📚 Vocab</span>
        </div>
      </div>

      {/* Content */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4">
        {step === 1 && renderReadDialog()}
        {step === 2 && renderExercises()}
        {step === 3 && renderQuiz()}
        {step === 4 && renderPronunciation()}
        {step === 5 && renderVocabulary()}
      </div>
    </div>
  );
}