// src/views/LessonsView.jsx
// Changes: locks lessons behind dialog completion
import React from "react";
import { lessons } from "../data/lessons.js";
import { dialogs } from "../data/dialogs.js";

// Returns the dialog(s) required before unlocking a given lesson
function getRequiredDialogForLesson(lessonId) {
  // The dialog that unlocks the NEXT lesson is the one with lessonId = lessonId - 1
  // e.g. to unlock lesson 2, you must complete the dialog with lessonId: 1
  return dialogs.filter((d) => d.lessonId === lessonId - 1);
}

function isLessonUnlocked(lessonId, completedLessons, completedDialogs) {
  if (lessonId === 1) return true; // first lesson always unlocked
  // Previous lesson must be done
  if (!completedLessons.has(lessonId - 1)) return false;
  // All dialogs linked to the previous lesson must be done
  const required = getRequiredDialogForLesson(lessonId);
  if (required.length === 0) return true; // no dialog required
  return required.every((d) => completedDialogs.has(d.id));
}

export default function LessonsView({
  completedLessons,
  completedDialogs,
  setSelectedLesson,
  setCurrentView,
}) {
  const categories = ["beginner", "intermediate", "advanced"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">📚 Lessons</h2>
        <p className="text-sm text-gray-500">
          Complete lessons then their dialog to unlock the next one
        </p>
      </div>

      {categories.map((cat) => {
        const catLessons = lessons.filter((l) => l.category === cat);
        if (!catLessons.length) return null;

        return (
          <div key={cat}>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
              {cat}
            </h3>
            <div className="space-y-2">
              {catLessons.map((lesson) => {
                const done = completedLessons.has(lesson.id);
                const unlocked = isLessonUnlocked(
                  lesson.id,
                  completedLessons,
                  completedDialogs
                );

                // Find which dialog is blocking this lesson
                const blockingDialogs = getRequiredDialogForLesson(lesson.id);
                const pendingDialog = blockingDialogs.find(
                  (d) => !completedDialogs.has(d.id)
                );

                return (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      if (!unlocked) return;
                      setSelectedLesson(lesson);
                      setCurrentView("lesson");
                    }}
                    disabled={!unlocked}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                      done
                        ? "bg-green-50 border-green-200"
                        : unlocked
                        ? "bg-white border-gray-100 hover:border-blue-300 hover:shadow-sm active:scale-99"
                        : "bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`text-3xl w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0 ${
                        done
                          ? "bg-green-100"
                          : unlocked
                          ? "bg-blue-50"
                          : "bg-gray-100"
                      }`}
                    >
                      {!unlocked ? "🔒" : lesson.icon}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`font-semibold ${
                            done
                              ? "text-green-800"
                              : unlocked
                              ? "text-gray-900"
                              : "text-gray-400"
                          }`}
                        >
                          {lesson.id}. {lesson.title}
                        </p>
                        {done && (
                          <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-medium">
                            ✓ Done
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {lesson.words.length} words
                        {!unlocked && pendingDialog && (
                          <span className="text-orange-500 ml-2">
                            · Complete dialog "{pendingDialog.title}" first
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Arrow */}
                    {unlocked && (
                      <span className="text-gray-300 flex-shrink-0">›</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}