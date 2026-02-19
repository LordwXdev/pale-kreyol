// src/components/LessonCompleteModal.jsx
import React, { useEffect, useState } from "react";
import { dialogs } from "../data/dialogs.js";

export default function LessonCompleteModal({
  lesson,
  xpEarned,
  score,
  totalQuestions,
  newBadges = [],
  onContinue,       // go to lessons list
  onPracticeDialog, // go straight to the linked dialog
  onClose,
}) {
  const [show, setShow] = useState(false);

  // Animate in
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Find the dialog linked to this lesson
  const linkedDialog = dialogs.find((d) => d.lessonId === lesson?.id);
  const perfect = score === totalQuestions;
  const percent = Math.round((score / totalQuestions) * 100);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-all duration-300 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-sm mx-4 mb-4 sm:mb-0 bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
          show ? "translate-y-0 scale-100" : "translate-y-8 scale-95"
        }`}
      >
        {/* Top gradient banner */}
        <div className={`px-6 pt-8 pb-6 text-center ${
          perfect
            ? "bg-gradient-to-br from-yellow-400 to-orange-500"
            : percent >= 60
            ? "bg-gradient-to-br from-blue-500 to-purple-600"
            : "bg-gradient-to-br from-gray-400 to-gray-600"
        }`}>
          {/* Trophy / emoji */}
          <div className="text-6xl mb-2">
            {perfect ? "🏆" : percent >= 60 ? "🎉" : "💪"}
          </div>
          <h2 className="text-2xl font-bold text-white">
            {perfect ? "Pafè! Perfect!" : percent >= 60 ? "Bon travay!" : "Kontinye!"}
          </h2>
          <p className="text-white/80 text-sm mt-1">
            {perfect
              ? "You got every answer right!"
              : percent >= 60
              ? "Great job completing the lesson"
              : "Keep practicing — you'll get there!"}
          </p>
        </div>

        {/* Stats */}
        <div className="px-6 py-5 space-y-4">
          {/* Score + XP row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-2xl p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{score}/{totalQuestions}</p>
              <p className="text-xs text-gray-500 mt-0.5">Score</p>
            </div>
            <div className="bg-purple-50 rounded-2xl p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">{percent}%</p>
              <p className="text-xs text-gray-500 mt-0.5">Accuracy</p>
            </div>
            <div className="bg-yellow-50 rounded-2xl p-3 text-center">
              <p className="text-2xl font-bold text-yellow-600">+{xpEarned}</p>
              <p className="text-xs text-gray-500 mt-0.5">XP</p>
            </div>
          </div>

          {/* Lesson name */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
            <span className="text-2xl">{lesson?.icon}</span>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{lesson?.title}</p>
              <p className="text-xs text-green-600 font-medium">✓ Lesson complete</p>
            </div>
          </div>

          {/* New badges */}
          {newBadges.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3">
              <p className="text-xs font-bold text-yellow-800 mb-2">🏅 New Badge{newBadges.length > 1 ? "s" : ""} Unlocked!</p>
              <div className="flex gap-2 flex-wrap">
                {newBadges.map((badge) => (
                  <div key={badge.id} className="flex items-center gap-1.5 bg-white rounded-xl px-2 py-1 border border-yellow-200">
                    <span>{badge.icon}</span>
                    <span className="text-xs font-semibold text-gray-800">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next step callout — linked dialog */}
          {linkedDialog && (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl px-4 py-3">
              <p className="text-xs font-bold text-purple-800 mb-1">📌 Next Step</p>
              <p className="text-xs text-purple-700">
                Complete the dialog <span className="font-semibold">"{linkedDialog.title}"</span> to unlock Lesson {lesson.id + 1}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-2 pt-1">
            {linkedDialog && (
              <button
                onClick={onPracticeDialog}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition text-sm"
              >
                💬 Practice "{linkedDialog.title}" →
              </button>
            )}
            <button
              onClick={onContinue}
              className={`w-full font-semibold py-3 rounded-2xl transition text-sm ${
                linkedDialog
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90"
              }`}
            >
              {linkedDialog ? "Back to Lessons" : "🎯 Continue Learning →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}