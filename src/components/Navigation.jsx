import React from 'react';
import { Home, BookOpen, Trophy, Settings } from 'lucide-react';
import { auth, db } from "../firebase/config";

export default function Navigation({ currentView, setCurrentView, setQuizMode }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex justify-around z-10">
      {[
        { icon: Home, label: 'Home', view: 'home' },
        { icon: BookOpen, label: 'Lessons', view: 'lessons' },
        { icon: Trophy, label: 'Progress', view: 'progress' },
        { icon: Settings, label: 'Settings', view: 'settings' }
      ].map(({ icon: Icon, label, view }) => (
        <button
          key={view}
          onClick={() => {
            setCurrentView(view);
            setQuizMode(false);
          }}
          className={`flex flex-col items-center gap-1 transition-all ${currentView === view ? 'text-blue-600' : 'text-gray-500'}`}
        >
          <Icon size={24} />
          <span className="text-xs font-medium">{label}</span>
        </button>
      ))}
    </nav>
  );
}
