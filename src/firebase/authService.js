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
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

// ---------------------------
// CREATE USER DOCUMENT
// ---------------------------
const createUserDoc = async (user) => {
  try {
    const ref = doc(db, "users", user.uid);

    await setDoc(
      ref,
      {
        email: user.email || "",
        name: user.displayName || "",
        country: "",
        avatar: user.photoURL || "",
        phone: user.phoneNumber || "",
        xp: 0,
        streak: 0,
        completedLessons: [],
        quizzesTaken: 0,
        darkMode: false,
        createdAt: serverTimestamp(),
        emailVerified: user.emailVerified
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error creating user document:", error);
  }
};

// ---------------------------
// REGISTER WITH EMAIL
// ---------------------------
export const registerWithEmail = async (email, password) => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    
    // Create user document first
    await createUserDoc(cred.user);
    
    // Send verification email with simplified settings
    try {
      await sendEmailVerification(cred.user, {
        url: `${window.location.origin}/verify`,
        handleCodeInApp: false,
      });
      console.log("Verification email sent successfully");
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      // Don't throw error - let user login even if email fails
      // They can resend from the verification gate
    }
    
    return cred.user;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// ---------------------------
// LOGIN WITH EMAIL
// ---------------------------
export const loginWithEmail = async (email, password, rememberMe) => {
  try {
    const persistence = rememberMe
      ? browserLocalPersistence
      : browserSessionPersistence;

    await setPersistence(auth, persistence);

    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    
    // Update user document
    await createUserDoc(cred.user);

    return cred.user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// ---------------------------
// GOOGLE LOGIN
// ---------------------------
export const loginWithGoogle = async (rememberMe) => {
  try {
    const persistence = rememberMe
      ? browserLocalPersistence
      : browserSessionPersistence;

    await setPersistence(auth, persistence);

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    const cred = await signInWithPopup(auth, provider);

    await createUserDoc(cred.user);

    return cred.user;
  } catch (error) {
    console.error("Google login error:", error);
    throw error;
  }
};

// ---------------------------
// PASSWORD RESET
// ---------------------------
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email.trim(), {
      url: window.location.origin,
      handleCodeInApp: false,
    });
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
};

// ---------------------------
// RESEND VERIFICATION EMAIL
// ---------------------------
export const resendVerificationEmail = async (user) => {
  try {
    if (!user) {
      throw new Error("No user logged in");
    }
    
    // Reload user to get latest email verification status
    await user.reload();
    
    if (user.emailVerified) {
      throw new Error("Email already verified");
    }
    
    await sendEmailVerification(user, {
      url: `${window.location.origin}/verify`,
      handleCodeInApp: false,
    });
    
    console.log("Verification email resent successfully");
  } catch (error) {
    console.error("Error resending verification email:", error);
    throw error;
  }
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
// PHONE VERIFICATION
// ---------------------------
let recaptchaVerifier;

export const setupRecaptcha = (containerId = "recaptcha-container") => {
  // Clear existing verifier if any
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
  }
  
  recaptchaVerifier = new RecaptchaVerifier(
    auth,
    containerId,
    { 
      size: "normal",
      callback: (response) => {
        console.log("reCAPTCHA solved");
      },
      "expired-callback": () => {
        console.log("reCAPTCHA expired");
      }
    }
  );
  
  return recaptchaVerifier;
};

export const sendPhoneCode = async (phoneNumber, recaptchaVerifier) => {
  try {
    const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return confirmation;
  } catch (error) {
    console.error("Phone code error:", error);
    throw error;
  }
};

export const verifyPhoneCode = async (confirmationResult, code) => {
  try {
    const result = await confirmationResult.confirm(code);
    await createUserDoc(result.user);
    return result.user;
  } catch (error) {
    console.error("Code verification error:", error);
    throw error;
  }
};