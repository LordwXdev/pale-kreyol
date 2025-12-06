// src/firebase/userService.js

// Make sure a user document exists
export const ensureUserDoc = async (uid, email = "") => {
  if (!uid) return;
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email: email,
      name: "",
      country: "",
      avatar: "",
      phone: "",
      xp: 0,
      streak: 0,
      completedLessons: [],
      quizzesTaken: 0,
      darkMode: false,
      dailyGoal: 30, // minutes or XP – up to you
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
};

// Listen live to profile
export const subscribeToUserProfile = (uid, callback) => {
  if (!uid) return () => {};
  const ref = doc(db, "users", uid);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) callback(snap.data());
  });
};

// Update profile fields (name, avatar, country, dark mode, phone, etc.)
export const updateUserProfile = async (uid, data) => {
  if (!uid) return;
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    ...data,
    updatedAt: new Date(),
  });
};

// Save XP, streak, completed lesson, quiz count
export const saveQuizProgress = async (uid, { lessonId, xpEarned, streak }) => {
  if (!uid) return;
  const ref = doc(db, "users", uid);

  await updateDoc(ref, {
    xp: increment(xpEarned || 0),
    streak: streak ?? 0,
    quizzesTaken: increment(1),
    completedLessons: arrayUnion(lessonId),
    updatedAt: new Date(),
  });
};

// Optional: keep a history of quiz results
export const saveQuizResult = async (
  uid,
  { lessonId, quizType, score, totalQuestions }
) => {
  if (!uid) return;
  const ref = doc(db, "quizResults", uid); // one doc per user

  await setDoc(
    ref,
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

// Reset progress (for "Reset account" button)
export const resetUserProgress = async (uid) => {
  if (!uid) return;
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    xp: 0,
    streak: 0,
    completedLessons: [],
    quizzesTaken: 0,
    updatedAt: new Date(),
  });
};
