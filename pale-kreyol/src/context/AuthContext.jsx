// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { subscribeToAuth, logout } from "../firebase/authService";
import { subscribeToUserProfile } from "../firebase/userService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // auth listener
  useEffect(() => {
    const unsub = subscribeToAuth(async (user) => {
      setFirebaseUser(user);
      setLoading(false);
    });
    return unsub;
  }, []);

  // profile listener
  useEffect(() => {
    if (!firebaseUser) {
      setProfile(null);
      return;
    }
    const unsub = subscribeToUserProfile(firebaseUser.uid, (data) => {
      setProfile(data);
    });
    return unsub;
  }, [firebaseUser]);

  // dark mode sync
  useEffect(() => {
    if (!profile) return;
    if (profile.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [profile]);

  const value = {
    user: firebaseUser,
    profile,
    loading,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
