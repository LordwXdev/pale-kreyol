// src/firebase/userService.js
import {
  doc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  increment,
  collection,
  addDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "./config";

// Subscribe to live user profile
export const subscribeToUserProfile = (uid, callback) => {
  const ref = doc(db, "users", uid);
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
};

// Update basic profile
export const updateProfile = async (uid, { name, country, avatar }) => {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    name: name ?? "",
    country: country ?? "",
    avatar: avatar ?? "",
  });
};

// Toggle dark mode
export const toggleDarkMode = async (uid, currentValue) => {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { darkMode: !currentValue });
};

// Save learning progress summary after each quiz
export const saveQuizProgress = async (uid, {
  lessonId,
  xpEarned,
  streak,
}) => {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    xp: increment(xpEarned),
    streak,
    quizzesTaken: increment(1),
    completedLessons: arrayUnion(lessonId),
  });
};

// Save detailed quiz result (subcollection)
export const saveQuizResult = async (uid, {
  lessonId,
  quizType,
  score,
  totalQuestions,
  createdAt = new Date(),
}) => {
  const ref = collection(db, "users", uid, "quizResults");
  await addDoc(ref, {
    lessonId,
    quizType,
    score,
    totalQuestions,
    createdAt,
  });
};

// Reset account stats (optionally wipe quizResults)
export const resetAccountProgress = async (uid, { deleteResults = false } = {}) => {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    xp: 0,
    streak: 0,
    completedLessons: [],
    quizzesTaken: 0,
  });

  if (deleteResults) {
    const resultsCol = collection(db, "users", uid, "quizResults");
    const snap = await getDocs(resultsCol);
    const deletions = snap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletions);
  }
};
