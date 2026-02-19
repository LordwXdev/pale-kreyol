// src/views/ProgressView.jsx
// Tabs: Stats | Vocabulary | Badges | Ranks
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getLeaderboard,
  LEVEL_NAMES,
  xpProgressPercent,
  xpToNextLevel,
  calculateLevel,
  BADGE_DEFINITIONS,
} from "../firebase/UserService";
import { lessons } from "../data/lessons.js";
import { dialogs } from "../data/dialogs.js";

export default function ProgressView({
  totalPoints,
  completedCount,
  completedLessons,   // Set of completed lesson IDs
  completedDialogs,   // Set of completed dialog IDs
  streak,
}) {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState("stats");
  const [leaders, setLeaders] = useState([]);
  const [loadingLeaders, setLoadingLeaders] = useState(false);
  const [vocabSearch, setVocabSearch] = useState("");
  const [vocabFilter, setVocabFilter] = useState("all"); // "all" | "lessons" | "dialogs"

  const xp = profile?.xp ?? totalPoints ?? 0;
  const currentStreak = profile?.streak ?? streak ?? 0;
  const level = calculateLevel(xp);
  const levelName = LEVEL_NAMES[level] || "";
  const percent = xpProgressPercent(xp);
  const toNext = xpToNextLevel(xp);
  const earnedBadges = profile?.badges || [];
  const MEDALS = ["🥇", "🥈", "🥉"];

  // ── Build vocabulary from completed lessons + dialogs ──────────────
  const learnedVocab = React.useMemo(() => {
    const vocab = [];
    const seen = new Set();

    const addWord = (word, source, sourceId) => {
      const key = word.creole?.toLowerCase();
      if (!key || seen.has(key)) return;
      seen.add(key);
      vocab.push({ ...word, source, sourceId });
    };

    // Words from completed lessons
    lessons.forEach((lesson) => {
      if (completedLessons.has(lesson.id)) {
        lesson.words.forEach((w) =>
          addWord(w, "lesson", lesson.id)
        );
      }
    });

    // Vocabulary from completed dialogs
    dialogs.forEach((dialog) => {
      if (completedDialogs.has(dialog.id) && dialog.vocabulary) {
        dialog.vocabulary.forEach((w) =>
          addWord(w, "dialog", dialog.id)
        );
      }
    });

    return vocab.sort((a, b) => a.creole.localeCompare(b.creole));
  }, [completedLessons, completedDialogs]);

  const filteredVocab = learnedVocab.filter((w) => {
    const matchesSearch =
      !vocabSearch ||
      w.creole.toLowerCase().includes(vocabSearch.toLowerCase()) ||
      w.english.toLowerCase().includes(vocabSearch.toLowerCase());
    const matchesFilter =
      vocabFilter === "all" ||
      w.source === vocabFilter.replace("s", ""); // "lessons"→"lesson"
    return matchesSearch && matchesFilter;
  });

  // ── Load leaderboard only when tab opens ──────────────────────────
  useEffect(() => {
    if (tab === "ranks" && leaders.length === 0) {
      setLoadingLeaders(true);
      getLeaderboard(50).then((data) => {
        setLeaders(data);
        setLoadingLeaders(false);
      });
    }
  }, [tab]);

  const TABS = [
    { id: "stats",  label: "📊 Stats" },
    { id: "vocab",  label: `📖 Vocab (${learnedVocab.length})` },
    { id: "badges", label: "🏅 Badges" },
    { id: "ranks",  label: "🏆 Ranks" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">📈 Progress</h2>
        <p className="text-sm text-gray-500">Track your Haitian Creole journey</p>
      </div>

      {/* XP / Level hero card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-blue-100 text-sm">Current Level</p>
            <p className="text-3xl font-bold">Level {level}</p>
            <p className="text-blue-200 text-sm font-medium">{levelName}</p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">Total XP</p>
            <p className="text-2xl font-bold">{xp.toLocaleString()}</p>
          </div>
        </div>
        <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
        {toNext > 0 && (
          <p className="text-blue-200 text-xs mt-1 text-right">
            {toNext} XP to next level
          </p>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { value: currentStreak, label: "🔥 Streak", color: "text-orange-500" },
          { value: completedLessons.size, label: "📚 Lessons", color: "text-blue-600" },
          { value: completedDialogs.size, label: "💬 Dialogs", color: "text-purple-600" },
          { value: earnedBadges.length, label: "🏅 Badges", color: "text-yellow-600" },
        ].map(({ value, label, color }) => (
          <div key={label} className="bg-white rounded-2xl p-3 text-center border border-gray-100 shadow-sm">
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 px-1 rounded-xl text-xs font-medium transition ${
              tab === t.id
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── STATS TAB ─────────────────────────────────────────────── */}
      {tab === "stats" && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-2.5">
            {[
              { label: "Total XP earned",       value: `${xp.toLocaleString()} XP`,                    color: "text-blue-600" },
              { label: "Level",                  value: `${level} — ${levelName}`,                      color: "text-purple-600" },
              { label: "Day streak",             value: `${currentStreak} days 🔥`,                     color: "text-orange-500" },
              { label: "Lessons completed",      value: `${completedLessons.size} / ${lessons.length}`, color: "text-green-600" },
              { label: "Dialogs completed",      value: `${completedDialogs.size} / ${dialogs.length}`, color: "text-indigo-600" },
              { label: "Vocabulary learned",     value: `${learnedVocab.length} words`,                 color: "text-teal-600" },
              { label: "Quizzes taken",          value: `${profile?.quizzesTaken ?? 0}`,                color: "text-pink-600" },
              { label: "Badges earned",          value: `${earnedBadges.length} / ${Object.keys(BADGE_DEFINITIONS).length}`, color: "text-yellow-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">{label}</span>
                <span className={`text-sm font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>

          {/* Lesson + Dialog completion overview */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm">Lesson & Dialog Progress</h3>
            <div className="space-y-2">
              {lessons.slice(0, 5).map((lesson) => {
                const lessonDone = completedLessons.has(lesson.id);
                const linkedDialogs = dialogs.filter((d) => d.lessonId === lesson.id);
                const dialogsDone = linkedDialogs.filter((d) => completedDialogs.has(d.id)).length;
                return (
                  <div key={lesson.id} className="flex items-center gap-3">
                    <span className="text-lg flex-shrink-0">{lesson.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">
                        {lesson.id}. {lesson.title}
                      </p>
                      <div className="flex gap-2 mt-0.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${lessonDone ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                          {lessonDone ? "✓ Lesson" : "○ Lesson"}
                        </span>
                        {linkedDialogs.length > 0 && (
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${dialogsDone === linkedDialogs.length ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-400"}`}>
                            {dialogsDone}/{linkedDialogs.length} Dialog{linkedDialogs.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {lessons.length > 5 && (
                <p className="text-xs text-gray-400 text-center pt-1">
                  +{lessons.length - 5} more lessons
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── VOCABULARY TAB ────────────────────────────────────────── */}
      {tab === "vocab" && (
        <div className="space-y-3">
          {learnedVocab.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
              <p className="text-4xl mb-2">📖</p>
              <p className="text-gray-500 text-sm font-medium">No vocabulary yet</p>
              <p className="text-gray-400 text-xs mt-1">
                Complete lessons and dialogs to build your vocab list
              </p>
            </div>
          ) : (
            <>
              {/* Search + filter */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search words..."
                  value={vocabSearch}
                  onChange={(e) => setVocabSearch(e.target.value)}
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={vocabFilter}
                  onChange={(e) => setVocabFilter(e.target.value)}
                  className="bg-white border border-gray-200 rounded-xl px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="lesson">Lessons</option>
                  <option value="dialog">Dialogs</option>
                </select>
              </div>

              <p className="text-xs text-gray-400 px-1">
                {filteredVocab.length} word{filteredVocab.length !== 1 ? "s" : ""} learned
              </p>

              {/* Word grid */}
              <div className="space-y-2">
                {filteredVocab.map((word, i) => (
                  <div
                    key={`${word.creole}-${i}`}
                    className="bg-white rounded-xl px-4 py-3 border border-gray-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{word.creole}</p>
                      <p className="text-xs text-gray-500">{word.english}</p>
                      {word.pronunciation && (
                        <p className="text-xs text-blue-400 mt-0.5 italic">
                          /{word.pronunciation}/
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                        word.source === "lesson"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-purple-50 text-purple-600"
                      }`}
                    >
                      {word.source === "lesson" ? `L${word.sourceId}` : `D${word.sourceId}`}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── BADGES TAB ────────────────────────────────────────────── */}
      {tab === "badges" && (
        <div className="space-y-3">
          {/* Earned */}
          {earnedBadges.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {earnedBadges.map((badgeId) => {
                const def = BADGE_DEFINITIONS[badgeId];
                if (!def) return null;
                return (
                  <div key={badgeId} className="bg-white rounded-2xl p-3 text-center border border-yellow-100 shadow-sm">
                    <div className="text-3xl mb-1">{def.icon}</div>
                    <p className="text-xs font-bold text-gray-800">{def.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{def.desc}</p>
                  </div>
                );
              })}
            </div>
          )}

          {earnedBadges.length === 0 && (
            <div className="text-center py-8 bg-white rounded-2xl border border-gray-100">
              <p className="text-4xl mb-2">🎯</p>
              <p className="text-gray-500 text-sm">Complete lessons and quizzes to earn badges!</p>
            </div>
          )}

          {/* Locked */}
          <div>
            <p className="text-xs text-gray-400 font-medium mb-2 px-1">Locked</p>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(BADGE_DEFINITIONS)
                .filter(([id]) => !earnedBadges.includes(id))
                .map(([id, def]) => (
                  <div key={id} className="bg-gray-50 rounded-2xl p-3 text-center border border-gray-100 opacity-50">
                    <div className="text-3xl mb-1">{def.icon}</div>
                    <p className="text-xs font-bold text-gray-500">{def.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{def.desc}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ── RANKS TAB ─────────────────────────────────────────────── */}
      {tab === "ranks" && (
        <div className="space-y-2">
          {loadingLeaders ? (
            <div className="text-center py-10 text-gray-400">Loading rankings...</div>
          ) : leaders.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-400 text-sm">No rankings yet. Be the first! 🏆</p>
            </div>
          ) : (
            leaders.map((entry, i) => {
              const isMe = entry.uid === user?.uid;
              return (
                <div
                  key={entry.uid}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition ${
                    isMe
                      ? "bg-blue-50 border-blue-300 shadow-sm"
                      : "bg-white border-gray-100"
                  }`}
                >
                  <div className="w-7 text-center font-bold text-gray-500 text-sm flex-shrink-0">
                    {i < 3 ? MEDALS[i] : `#${entry.rank}`}
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
                    {entry.avatar ? (
                      <img src={entry.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      entry.name?.[0]?.toUpperCase() || "?"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {entry.name}
                      {isMe && <span className="text-blue-500 ml-1 text-xs">(You)</span>}
                    </p>
                    <p className="text-xs text-gray-400">
                      Lv.{entry.level} · 🔥 {entry.streak}d
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-blue-600 text-sm">{entry.xp.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">XP</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}