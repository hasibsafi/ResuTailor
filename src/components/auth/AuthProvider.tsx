"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, signOut as firebaseSignOut } from "@/lib/firebase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await upsertUserProfile(result.user);
  };

  const signInWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await upsertUserProfile(result.user);
  };

  const signUpWithEmail = async (name: string, email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(result.user, { displayName: name });
    }
    await upsertUserProfile(result.user, { name, isNew: true });
  };

  const signOut = async () => {
    await firebaseSignOut();
  };

  const upsertUserProfile = async (
    user: User,
    options?: { name?: string; isNew?: boolean }
  ) => {
    const userRef = doc(db, "users", user.uid);
    const payload: Record<string, unknown> = {
      uid: user.uid,
      email: user.email || null,
      name: options?.name || user.displayName || null,
      photoUrl: user.photoURL || null,
      providerId: user.providerData?.[0]?.providerId || null,
      lastLoginAt: serverTimestamp(),
    };
    if (options?.isNew) {
      payload.createdAt = serverTimestamp();
    }
    await setDoc(userRef, payload, { merge: true });
  };

  const value = useMemo(
    () => ({ user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
