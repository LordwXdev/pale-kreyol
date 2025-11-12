import React from 'react';
import LessonCard from '../components/LessonCard.jsx';
import { Star } from 'lucide-react';
import { lessons } from '../data/lessons.js';
import { quizTypes } from '../data/quizzes.js';

export default function HomeView({ completedLessons, totalPoints, streak, setSelectedLesson, setCurrentView, startQuiz }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome to Pale Kreyòl!</h2>
        <p className="opacity-90 mb-4">Start your journey learning Haitian Creole</p>
        <div className="flex items-center gap-4">
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <div className="text-2xl font-bold">{completedLessons.size}</div>
            <div className="text-xs opacity-80">Lessons</div>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <div className="text-2xl font-bold">{totalPoints}</div>
            <div className="text-xs opacity-80">Points</div>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <div className="text-2xl font-bold">{streak}</div>
            <div className="text-xs opacity-80">Streak</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Star className="text-yellow-500" size={20} />
          Continue Learning
        </h3>
        <div className="space-y-3">
          {lessons.slice(0, 3).map(lesson => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              completed={completedLessons.has(lesson.id)}
              onClick={() => { setSelectedLesson(lesson); setCurrentView('lesson'); }}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-3">Quick Practice</h3>
        <div className="grid grid-cols-2 gap-3">
          {quizTypes.map(type => (
            <button
              key={type.id}
              onClick={() => {
                const randomLesson = lessons[Math.floor(Math.random() * lessons.length)];
                setSelectedLesson(randomLesson);
                startQuiz(type.id);
              }}
              className={`bg-gradient-to-br ${type.color} text-white p-4 rounded-xl hover:opacity-90 transition-opacity`}
            >
              <type.icon size={32} className="mb-2 mx-auto" />
              <div className="font-semibold text-sm">{type.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
