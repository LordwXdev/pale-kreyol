import React, { createContext, useContext, useEffect, useState } from "react";
import { subscribeToAuth, logout } from "../firebase/authService";
import { subscribeToUserProfile } from "../firebase/UserService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = subscribeToAuth((user) => {
      setFirebaseUser(user);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Listen to Firestore user profile
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

  const value = {
    user: firebaseUser,
    profile,
    loading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
