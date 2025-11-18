// src/firebase/authService.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  signInWithPhoneNumber,
} from "firebase/auth";
import {
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, setupRecaptcha, setAuthPersistence } from "./config";

// Create Firestore user document on first registration
const createUserDoc = async (user, extra = {}) => {
  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, {
    email: user.email || "",
    name: "",
    country: "",
    avatar: "",
    phone: user.phoneNumber || "",
    xp: 0,
    streak: 0,
    completedLessons: [],
    quizzesTaken: 0,
    darkMode: false,
    createdAt: serverTimestamp(),
    ...extra,
  }, { merge: true });
};

// Email + password registration with email verification
export const registerWithEmail = async (email, password) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await createUserDoc(cred.user);
  await sendEmailVerification(cred.user);
  return cred.user;
};

// Email login with remember-me option
export const loginWithEmail = async (email, password, remember) => {
  await setAuthPersistence(remember);
  const cred = await signInWithEmailAndPassword(auth, email, password);
  // make sure user doc exists
  await createUserDoc(cred.user);
  return cred.user;
};

// Google login
export const loginWithGoogle = async (remember) => {
  await setAuthPersistence(remember);
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  await createUserDoc(cred.user);
  return cred.user;
};

// Password reset by email
export const resetPassword = (email) => {
  return sendPasswordResetEmail(auth, email);
};

// Logout
export const logout = () => signOut(auth);

// Auth listener (auto-login)
export const subscribeToAuth = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Phone verification (send SMS)
export const sendPhoneCode = async (phoneNumber, containerId) => {
  const appVerifier = setupRecaptcha(containerId);
  const confirmationResult = await signInWithPhoneNumber(
    auth,
    phoneNumber,
    appVerifier
  );
  // store in window to reuse
  window.confirmationResult = confirmationResult;
  return confirmationResult;
};

// Confirm SMS code
export const verifyPhoneCode = async (code) => {
  if (!window.confirmationResult) {
    throw new Error("No confirmation session found. Send code first.");
  }
  const result = await window.confirmationResult.confirm(code);
  await createUserDoc(result.user, { phone: result.user.phoneNumber || "" });
  return result.user;
};
