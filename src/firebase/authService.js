import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  PhoneAuthProvider
} from "firebase/auth";

// ---------------------------
// CREATE USER DOCUMENT
// ---------------------------
const createUserDoc = async (user) => {
  const ref = doc(db, "users", user.uid);

  await setDoc(
    ref,
    {
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
      createdAt: serverTimestamp()
    },
    { merge: true }
  );
};

// ---------------------------
// REGISTER WITH EMAIL
// ---------------------------
export const registerWithEmail = async (email, password) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await createUserDoc(cred.user);
  await sendEmailVerification(cred.user);
  return cred.user;
};

// ---------------------------
// LOGIN WITH EMAIL
// ---------------------------
export const loginWithEmail = async (email, password, rememberMe) => {
  const persistence = rememberMe
    ? browserLocalPersistence
    : browserSessionPersistence;

  await setPersistence(auth, persistence);

  const cred = await signInWithEmailAndPassword(auth, email, password);
  await createUserDoc(cred.user);

  return cred.user;
};

// ---------------------------
// GOOGLE LOGIN
// ---------------------------
export const loginWithGoogle = async (rememberMe) => {
  const persistence = rememberMe
    ? browserLocalPersistence
    : browserSessionPersistence;

  await setPersistence(auth, persistence);

  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);

  await createUserDoc(cred.user);

  return cred.user;
};

// ---------------------------
// PASSWORD RESET (THE ONE YOU WERE MISSING)
// ---------------------------
export const resetPassword = async (email) => {
  return sendPasswordResetEmail(auth, email);
};

// ---------------------------
// LOGOUT
// ---------------------------
export const logout = () => signOut(auth);

// ---------------------------
// AUTH SUBSCRIBE
// ---------------------------
export const subscribeToAuth = (callback) =>
  onAuthStateChanged(auth, callback);

// ---------------------------
// PHONE VERIFICATION (FOR LATER)
// ---------------------------
let recaptchaVerifier;

export const sendPhoneCode = async (phoneNumber, recaptchaId = "recaptcha-container") => {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(
      recaptchaId,
      { size: "invisible" },
      auth
    );
  }

  const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  return confirmation;
};
