// src/views/DialogsView.jsx
import React from "react";
import { dialogs } from "../data/dialogs";

export default function DialogsView({ 
  completedDialogs, 
  setSelectedDialog, 
  setCurrentView 
}) {
  const categories = {
    beginner: { label: "Beginner", color: "from-green-500 to-emerald-500" },
    intermediate: { label: "Intermediate", color: "from-blue-500 to-cyan-500" },
    advanced: { label: "Advanced", color: "from-purple-500 to-pink-500" }
  };

  const dialogsByCategory = Object.keys(categories).map(cat => ({
    category: cat,
    ...categories[cat],
    dialogs: dialogs.filter(d => d.category === cat)
  }));

  const totalCompleted = completedDialogs?.size || 0;
  const totalDialogs = dialogs.length;
  const progressPercent = Math.round((totalCompleted / totalDialogs) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-2">Conversations 💬</h2>
        <p className="text-gray-600 mb-4">
          Practice real-life dialogues and conversations
        </p>
        
        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Your Progress</span>
            <span className="font-semibold text-blue-600">
              {totalCompleted}/{totalDialogs} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Dialogs by Category */}
      {dialogsByCategory.map(({ category, label, color, dialogs: categoryDialogs }) => (
        <div key={category}>
          <h3 className="text-lg font-bold mb-3 px-2">{label}</h3>
          <div className="space-y-3">
            {categoryDialogs.map((dialog) => {
              const isCompleted = completedDialogs?.has(dialog.id);
              
              return (
                <button
                  key={dialog.id}
                  onClick={() => {
                    setSelectedDialog(dialog);
                    setCurrentView("dialog");
                  }}
                  className="w-full bg-white rounded-xl shadow-md hover:shadow-lg transition p-4 text-left"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`text-4xl p-3 rounded-xl bg-gradient-to-br ${color} text-white`}>
                      {dialog.icon}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-bold text-gray-800">{dialog.title}</h4>
                        {isCompleted && (
                          <span className="text-green-500 text-xl">✓</span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {dialog.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs">
                        {/* Characters */}
                        <div className="flex items-center gap-1">
                          {dialog.characters.map((char, i) => (
                            <span key={i}>{char.avatar}</span>
                          ))}
                        </div>
                        
                        <span className="text-gray-400">•</span>
                        
                        {/* Stats */}
                        <span className="text-gray-500">
                          {dialog.conversation.length} lines
                        </span>
                        
                        <span className="text-gray-400">•</span>
                        
                        <span className="text-gray-500">
                          {dialog.comprehensionQuestions.length} questions
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
        <p className="font-semibold text-blue-900 mb-2">📚 How to use Dialogs:</p>
        <ol className="list-decimal list-inside space-y-1 text-blue-800">
          <li>Read the conversation with translations</li>
          <li>Practice pronunciation by listening</li>
          <li>Complete interactive exercises</li>
          <li>Answer comprehension questions</li>
          <li>Review vocabulary</li>
        </ol>
      </div>
    </div>
  );
}