import React from 'react';
import { ChevronRight } from 'lucide-react';
import { auth, db } from "../firebase/config";

export default function LessonCard({ lesson, onClick, completed }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
    >
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${completed ? 'bg-green-100' : 'bg-blue-100'}`}>
          {lesson.icon}
        </div>
        <div className="text-left">
          <h4 className="font-semibold text-gray-900">{lesson.title}</h4>
          <p className="text-sm text-gray-500">{lesson.words.length} words</p>
        </div>
      </div>
      <ChevronRight className="text-gray-400 group-hover:text-gray-600 transition-colors" size={20} />
    </button>
  );
}
