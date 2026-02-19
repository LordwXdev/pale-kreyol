// src/firebase/UserService.js
import { db } from "./config";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  increment,
  arrayUnion,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

// ── Ensure user doc exists ────────────────────────────────────────────
export const ensureUserDoc = async (uid, email = "") => {
  if (!uid) return;
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email,
      name: "",
      country: "",
      avatar: "",
      phone: "",
      xp: 0,
      level: 1,
      streak: 0,
      lastActiveDate: null,   // "YYYY-MM-DD" string — tracks streak
      role: "user",
      completedLessons: [],
      completedDialogs: [],
      quizzesTaken: 0,
      darkMode: false,
      dailyGoal: 30,
      subscription: { status: "free" },
      badges: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
};

// ── Live profile listener ─────────────────────────────────────────────
export const subscribeToUserProfile = (uid, callback) => {
  if (!uid) return () => {};
  const ref = doc(db, "users", uid);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
  });
};

// ── Update profile fields ─────────────────────────────────────────────
export const updateUserProfile = async (uid, data) => {
  if (!uid) return;
  await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// ── Date helpers ──────────────────────────────────────────────────────
// Returns today's date as "YYYY-MM-DD" in local time
function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Returns how many calendar days apart two "YYYY-MM-DD" strings are
function daysBetween(dateStrA, dateStrB) {
  const a = new Date(dateStrA + "T00:00:00");
  const b = new Date(dateStrB + "T00:00:00");
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

// ── Calculate new streak based on lastActiveDate ──────────────────────
// Rules:
//   - Same day as last activity  → streak unchanged (already counted today)
//   - Exactly 1 day since last   → streak + 1 (kept it going!)
//   - 0 lastActiveDate (new user)→ streak = 1
//   - 2+ days since last         → streak resets to 1
export function calculateStreak(currentStreak, lastActiveDate) {
  const today = todayString();

  if (!lastActiveDate) {
    // First time ever completing a lesson
    return { newStreak: 1, newLastActiveDate: today };
  }

  const diff = daysBetween(lastActiveDate, today);

  if (diff === 0) {
    // Already active today — don't increment, just return as-is
    return { newStreak: currentStreak, newLastActiveDate: lastActiveDate };
  }

  if (diff === 1) {
    // Completed a lesson yesterday and again today — keep the streak going
    return { newStreak: currentStreak + 1, newLastActiveDate: today };
  }

  // Missed one or more days — reset streak
  return { newStreak: 1, newLastActiveDate: today };
}

// ── Save quiz result + XP + lesson completion + streak ────────────────
export const saveQuizProgress = async (uid, { lessonId, xpEarned }) => {
  if (!uid) return;
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  const data = snap.data() || {};

  const currentXP   = data.xp || 0;
  const newXP       = currentXP + (xpEarned || 0);
  const newLevel    = calculateLevel(newXP);

  // ── Streak logic (date-based, not passed from component) ──────────
  const { newStreak, newLastActiveDate } = calculateStreak(
    data.streak || 0,
    data.lastActiveDate || null
  );

  await updateDoc(ref, {
    xp:              increment(xpEarned || 0),
    level:           newLevel,
    streak:          newStreak,
    lastActiveDate:  newLastActiveDate,     // persist today's date
    quizzesTaken:    increment(1),
    completedLessons: arrayUnion(lessonId),
    updatedAt:       serverTimestamp(),
  });

  const newBadges = await checkAndAwardBadges(uid, {
    xp:                    newXP,
    level:                 newLevel,
    streak:                newStreak,
    completedLessonsCount: (data.completedLessons?.length || 0) + 1,
  });

  return { newXP, newLevel, newStreak, newBadges };
};

// ── Save dialog completion ────────────────────────────────────────────
export const saveDialogProgress = async (uid, dialogId) => {
  if (!uid || !dialogId) return;
  await updateDoc(doc(db, "users", uid), {
    completedDialogs: arrayUnion(dialogId),
    updatedAt: serverTimestamp(),
  });
};

// ── Save quiz result history ──────────────────────────────────────────
export const saveQuizResult = async (uid, { lessonId, quizType, score, totalQuestions }) => {
  if (!uid) return;
  await setDoc(
    doc(db, "quizResults", uid),
    {
      results: arrayUnion({
        lessonId,
        quizType,
        score,
        totalQuestions,
        createdAt: new Date(),
      }),
    },
    { merge: true }
  );
};

// ── Reset progress ────────────────────────────────────────────────────
export const resetUserProgress = async (uid) => {
  if (!uid) return;
  await updateDoc(doc(db, "users", uid), {
    xp: 0,
    level: 1,
    streak: 0,
    lastActiveDate: null,
    completedLessons: [],
    completedDialogs: [],
    quizzesTaken: 0,
    badges: [],
    updatedAt: serverTimestamp(),
  });
};

// ── Leaderboard ───────────────────────────────────────────────────────
export const getLeaderboard = async (top = 50) => {
  const q = query(collection(db, "users"), orderBy("xp", "desc"), limit(top));
  const snap = await getDocs(q);
  return snap.docs.map((d, i) => ({
    rank: i + 1,
    uid: d.id,
    name: d.data().name || d.data().email?.split("@")[0] || "Learner",
    avatar: d.data().avatar || "",
    xp: d.data().xp || 0,
    level: d.data().level || 1,
    streak: d.data().streak || 0,
  }));
};

// ── XP / Level ────────────────────────────────────────────────────────
export const LEVEL_THRESHOLDS = [
  0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500,
  7500, 10000, 13000, 17000, 22000, 28000, 35000, 45000, 57000, 72000,
];

export const LEVEL_NAMES = [
  "", "Debutant", "Koumansan", "Aprantis", "Elèv", "Etidyan",
  "Pwogresis", "Ekspèt", "Mèt", "Gran Mèt", "Pwofesè Kreyol",
  "Ambasadè", "Lengwis", "Gramèryen", "Rakontè", "Bèl Pale",
  "Orateur", "Sanba", "Manman Lang", "Granmoun", "Sav Kreyol",
];

export function calculateLevel(xp) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function xpToNextLevel(xp) {
  const level = calculateLevel(xp);
  if (level >= LEVEL_THRESHOLDS.length) return 0;
  return LEVEL_THRESHOLDS[level] - xp;
}

export function xpProgressPercent(xp) {
  const level = calculateLevel(xp);
  if (level >= LEVEL_THRESHOLDS.length) return 100;
  const curr = LEVEL_THRESHOLDS[level - 1];
  const next = LEVEL_THRESHOLDS[level];
  return Math.round(((xp - curr) / (next - curr)) * 100);
}

// ── Badges ────────────────────────────────────────────────────────────
export const BADGE_DEFINITIONS = {
  first_lesson: { icon: "🎯", name: "First Steps",    desc: "Complete your first lesson" },
  streak_3:     { icon: "🔥", name: "On Fire",        desc: "3-day streak" },
  streak_7:     { icon: "⚡", name: "Week Warrior",   desc: "7-day streak" },
  streak_30:    { icon: "💥", name: "Monthly Master", desc: "30-day streak" },
  level_5:      { icon: "⭐", name: "Rising Star",    desc: "Reach level 5" },
  level_10:     { icon: "🏆", name: "Kreyol Expert",  desc: "Reach level 10" },
  xp_1000:      { icon: "💯", name: "XP Champ",       desc: "Earn 1000 XP" },
  xp_5000:      { icon: "👑", name: "XP Master",      desc: "Earn 5000 XP" },
};

export const checkAndAwardBadges = async (uid, { xp, level, streak, completedLessonsCount }) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  const current = snap.data()?.badges || [];
  const earned = [];

  const check = (id, condition) => {
    if (condition && !current.includes(id)) earned.push(id);
  };

  check("first_lesson", completedLessonsCount >= 1);
  check("streak_3",     streak >= 3);
  check("streak_7",     streak >= 7);
  check("streak_30",    streak >= 30);
  check("level_5",      level >= 5);
  check("level_10",     level >= 10);
  check("xp_1000",      xp >= 1000);
  check("xp_5000",      xp >= 5000);

  if (earned.length > 0) {
    await updateDoc(ref, { badges: arrayUnion(...earned) });
  }
  return earned.map((id) => ({ id, ...BADGE_DEFINITIONS[id] }));
};

// ── Admin ─────────────────────────────────────────────────────────────
export const setUserRole  = async (uid, role)   => updateDoc(doc(db, "users", uid), { role });
export const setBanStatus = async (uid, banned) => updateDoc(doc(db, "users", uid), { banned });
export const getAllUsers   = async () => {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
};