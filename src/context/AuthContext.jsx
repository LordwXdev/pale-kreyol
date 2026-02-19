// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { subscribeToUserProfile } from "../firebase/UserService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // ← NEW: live Firestore profile
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let profileUnsub = () => {};

    const authUnsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      // Unsubscribe from previous profile listener
      profileUnsub();

      if (firebaseUser) {
        // Subscribe to live Firestore profile
        profileUnsub = subscribeToUserProfile(firebaseUser.uid, (data) => {
          setProfile(data);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsub();
      profileUnsub();
    };
  }, []);

  const logoutUser = () => signOut(auth);

  // Handy derived flags
  const isAdmin = profile?.role === "admin";
  const isPremium = profile?.subscription?.status === "active";

  return (
    <AuthContext.Provider value={{ user, profile, loading, logoutUser, isAdmin, isPremium }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
