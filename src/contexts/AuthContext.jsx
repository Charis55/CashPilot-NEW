// src/contexts/AuthContext.jsx
import React, { useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";

import { auth } from "../firebase";

const AuthContext = React.createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simple sign-in — no email verification gate
  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function register(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user ?? null);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

<<<<<<< HEAD
  const value = { currentUser, login, register, resetPassword, logout };
=======
  // ----------------------------------------------------
  // 🔥 AUTH STATE LISTENER
  // ----------------------------------------------------
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      await user.reload();

      if (!user.emailVerified) {
        setCurrentUser({ ...user, unverified: true });
      } else {
        setCurrentUser(user);
      }
    } else {
      setCurrentUser(null);
    }

    // ✅ CRUCIAL FIX:
    setLoading(false);
  });

  return unsubscribe;
}, []);


  const value = {
    currentUser,
    login,
    register,
    resetPassword,
    logout,
  };
>>>>>>> d00d81699a16cd22837bda9c07dd0f897d27f92f

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
