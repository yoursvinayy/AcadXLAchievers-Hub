'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../lib/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Setting up auth listener...'); // Debug log
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user); // Debug log
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      console.log('Attempting login with email...'); // Debug log
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', userCredential.user); // Debug log
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error); // Debug log
      setError(error.message);
      throw error;
    }
  };

  const googleLogin = async () => {
    try {
      setError(null);
      console.log('Attempting Google login...'); // Debug log
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const userCredential = await signInWithPopup(auth, provider);
      console.log('Google login successful:', userCredential.user); // Debug log
      return userCredential.user;
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      console.log('Attempting logout...'); // Debug log
      await signOut(auth);
      console.log('Logout successful'); // Debug log
    } catch (error) {
      console.error('Logout error:', error); // Debug log
      setError(error.message);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    googleLogin,
    logout
  };

  console.log('Current auth state:', { user, loading, error }); // Debug log

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 