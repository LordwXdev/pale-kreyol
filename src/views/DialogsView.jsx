// src/views/DialogsView.jsx
// Changes: shows which dialogs are locked (lesson not done yet)
import React from "react";
import { dialogs } from "../data/dialogs.js";

export default function DialogsView({
  completedDialogs,
  completedLessons,
  setSelectedDialog,
  setCurrentView,
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">💬 Dialogs</h2>
        <p className="text-sm text-gray-500">
          Complete the linked lesson before practicing each dialog
        </p>
      </div>

      <div className="space-y-3">
        {dialogs.map((dialog) => {
          const done = completedDialogs.has(dialog.id);
          // Dialog is unlocked if its linked lesson is completed
          const unlocked = completedLessons.has(dialog.lessonId);

          return (
            <button
              key={dialog.id}
              onClick={() => {
                if (!unlocked) return;
                setSelectedDialog(dialog);
                setCurrentView("dialog");
              }}
              disabled={!unlocked}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                done
                  ? "bg-green-50 border-green-200"
                  : unlocked
                  ? "bg-white border-gray-100 hover:border-purple-300 hover:shadow-sm"
                  : "bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed"
              }`}
            >
              {/* Icon */}
              <div
                className={`text-3xl w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0 ${
                  done
                    ? "bg-green-100"
                    : unlocked
                    ? "bg-purple-50"
                    : "bg-gray-100"
                }`}
              >
                {!unlocked ? "🔒" : dialog.icon}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p
                    className={`font-semibold ${
                      done
                        ? "text-green-800"
                        : unlocked
                        ? "text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    {dialog.title}
                  </p>
                  {done && (
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-medium">
                      ✓ Done
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {dialog.description}
                </p>
                {!unlocked && (
                  <p className="text-xs text-orange-500 mt-0.5 font-medium">
                    🔒 Complete Lesson {dialog.lessonId} first
                  </p>
                )}
                {unlocked && !done && (
                  <p className="text-xs text-purple-500 mt-0.5">
                    Linked to Lesson {dialog.lessonId}
                  </p>
                )}
              </div>

              {unlocked && (
                <span className="text-gray-300 flex-shrink-0">›</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}