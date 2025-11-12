import React from 'react';

export default function SettingsView({ resetAll }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">Settings</h2>
      
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold mb-3">About Pale Kreyòl</h3>
        <p className="text-gray-600 text-sm mb-3">
          Your interactive companion for learning Haitian Creole. Practice vocabulary, 
          take quizzes, and track your progress!
        </p>
        <div className="text-xs text-gray-500 space-y-1">
          <p>✨ 10 Complete lessons</p>
          <p>📚 100+ vocabulary words</p>
          <p>🎮 4 quiz modes</p>
          <p>🗣️ Audio pronunciation</p>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-4">
        <h3 className="font-semibold mb-2 text-blue-900">Learning Tips</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• Practice daily for best results</li>
          <li>• Use audio to improve pronunciation</li>
          <li>• Try different quiz modes</li>
          <li>• Review completed lessons regularly</li>
        </ul>
      </div>

      <button
        onClick={resetAll}
        className="w-full bg-red-50 text-red-600 font-medium py-3 rounded-xl hover:bg-red-100 transition-colors"
      >
        Reset Progress
      </button>
    </div>
  );
}
