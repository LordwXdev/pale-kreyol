import React from 'react';
import { lessons } from '../data/lessons.js';
import LessonCard from '../components/LessonCard.jsx';
import { auth, db } from "../firebase/config";

export default function LessonsView({ completedLessons, setSelectedLesson, setCurrentView }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">All Lessons</h2>
      {['beginner', 'intermediate', 'advanced'].map(category => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">{category}</h3>
          <div className="space-y-3">
            {lessons.filter(l => l.category === category).map(lesson => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                completed={completedLessons.has(lesson.id)}
                onClick={() => { setSelectedLesson(lesson); setCurrentView('lesson'); }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
