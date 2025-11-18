// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAuth } from "firebase/auth";
import {
  getAuth,
  RecaptchaVerifier,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB9CgtwcpNzxlPQSidFya4LfYYBvDbn8ds",
  authDomain: "palekreyol-971e9.firebaseapp.com",
  projectId: "palekreyol-971e9",
  storageBucket: "palekreyol-971e9.firebasestorage.app",
  messagingSenderId: "793836839934",
  appId: "1:793836839934:web:cf127b61c7777d6e7216af"
};

// Initialize Firebase
//const app = initializeApp(firebaseConfig);
//export const auth = getAuth(app);
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Remember-me helper
export const setAuthPersistence = async (remember) => {
  await setPersistence(
    auth,
    remember ? browserLocalPersistence : browserSessionPersistence
  );
};

// Setup invisible reCAPTCHA for phone auth
export const setupRecaptcha = (containerId = "recaptcha-container") => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      containerId,
      {
        size: "invisible",
      }
    );
  }
  return window.recaptchaVerifier;
};