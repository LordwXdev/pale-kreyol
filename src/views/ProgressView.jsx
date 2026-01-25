import React from 'react';
import { Award, Trophy, Zap, BookOpen } from 'lucide-react';
import { lessons } from '../data/lessons.js';
import { auth, db } from "../firebase/config";

export default function ProgressView({ totalPoints, completedCount, streak }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">Your Progress</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <Award size={32} className="mb-2" />
          <div className="text-3xl font-bold">{totalPoints}</div>
          <div className="text-sm opacity-80">Total Points</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
          <Trophy size={32} className="mb-2" />
          <div className="text-3xl font-bold">{completedCount}</div>
          <div className="text-sm opacity-80">Lessons Done</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white">
          <Zap size={32} className="mb-2" />
          <div className="text-3xl font-bold">{streak}</div>
          <div className="text-sm opacity-80">Current Streak</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
          <BookOpen size={32} className="mb-2" />
          <div className="text-3xl font-bold">{lessons.flatMap(l => l.words).length}</div>
          <div className="text-sm opacity-80">Words Available</div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold mb-3">Achievements</h3>
        <div className="space-y-3">
          {[
            { title: 'First Steps', desc: 'Complete your first lesson', unlocked: completedCount >= 1, icon: '🎯' },
            { title: 'Quick Learner', desc: 'Complete 3 lessons', unlocked: completedCount >= 3, icon: '⚡' },
            { title: 'Dedicated Student', desc: 'Complete 5 lessons', unlocked: completedCount >= 5, icon: '📚' },
            { title: 'Point Collector', desc: 'Earn 100 points', unlocked: totalPoints >= 100, icon: '💎' },
            { title: 'Point Master', desc: 'Earn 500 points', unlocked: totalPoints >= 500, icon: '👑' },
            { title: 'Hot Streak', desc: 'Get a 5 answer streak', unlocked: streak >= 5, icon: '🔥' },
          ].map((achievement, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl flex items-center gap-4 transition-all ${achievement.unlocked ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-gray-50'}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${achievement.unlocked ? 'bg-yellow-100' : 'bg-gray-200 grayscale'}`}>
                {achievement.icon}
              </div>
              <div>
                <h4 className={`font-semibold ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                  {achievement.title}
                </h4>
                <p className="text-sm text-gray-600">{achievement.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
