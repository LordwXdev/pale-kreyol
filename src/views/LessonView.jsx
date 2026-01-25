import React from 'react';
import { ChevronRight, Volume2 } from 'lucide-react';
import { quizTypes } from '../data/quizzes.js';
import { auth, db } from "../firebase/config";

export default function LessonView({ selectedLesson, setCurrentView, speakWord, startQuiz }) {
  if (!selectedLesson) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => setCurrentView('lessons')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronRight className="rotate-180" size={24} />
        </button>
        <div className="text-3xl">{selectedLesson.icon}</div>
        <h2 className="text-2xl font-bold">{selectedLesson.title}</h2>
      </div>

      <div className="space-y-3">
        {selectedLesson.words.map((word, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all animate-slide-up"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-2xl font-bold text-blue-600 mb-1">{word.creole}</h3>
                <p className="text-gray-600">{word.english}</p>
              </div>
              <button onClick={() => speakWord(word.creole)} className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors active:scale-95">
                <Volume2 className="text-blue-600" size={20} />
              </button>
            </div>
            <div className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              🗣️ {word.pronunciation}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quizTypes.map(type => (
          <button
            key={type.id}
            onClick={() => startQuiz(type.id)}
            className={`bg-gradient-to-br ${type.color} text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
          >
            <type.icon size={20} />
            {type.name}
          </button>
        ))}
      </div>
    </div>
  );
}
