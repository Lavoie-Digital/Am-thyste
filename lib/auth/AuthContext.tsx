"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  onIdTokenChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { getClientAuth, getClientDb, firebaseConfigured } from "../firebase/client";
import type { AppUser, ProStatus, UserRole } from "../types";

interface AuthContextValue {
  /** Firebase auth user, or null when signed out / unconfigured. */
  user: FirebaseUser | null;
  /** Firestore profile (role, proStatus…), or null. */
  profile: AppUser | null;
  loading: boolean;
  configured: boolean;
  role: UserRole;
  proStatus: ProStatus;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<FirebaseUser>;
  signInWithGoogle: () => Promise<FirebaseUser>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** POST the fresh ID token to the server so it can mint a session cookie. */
async function syncSession(fbUser: FirebaseUser | null) {
  try {
    if (fbUser) {
      const idToken = await fbUser.getIdToken();
      await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
    } else {
      await fetch("/api/session", { method: "DELETE" });
    }
  } catch (err) {
    console.error("[auth] session sync failed:", err);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(firebaseConfigured);

  useEffect(() => {
    const auth = getClientAuth();
    if (!auth) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    const unsub = onIdTokenChanged(auth, async (fbUser) => {
      setUser(fbUser);
      await syncSession(fbUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Live-subscribe to the user's Firestore profile (role / proStatus).
  useEffect(() => {
    const db = getClientDb();
    if (!db || !user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfile(null);
      return;
    }
    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setProfile(snap.exists() ? ({ uid: user.uid, ...snap.data() } as AppUser) : null);
      },
      (err) => console.error("[auth] profile subscribe failed:", err),
    );
    return () => unsub();
  }, [user]);

  const signIn = useCallback(async (email: string, password: string) => {
    const auth = getClientAuth();
    if (!auth) throw new Error("not-configured");
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await syncSession(cred.user);
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      const auth = getClientAuth();
      if (!auth) throw new Error("not-configured");
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) await updateProfile(cred.user, { displayName });
      await syncSession(cred.user);
      return cred.user;
    },
    [],
  );

  const signInWithGoogle = useCallback(async () => {
    const auth = getClientAuth();
    if (!auth) throw new Error("not-configured");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const cred = await signInWithPopup(auth, provider);
    await syncSession(cred.user);
    return cred.user;
  }, []);

  const signOut = useCallback(async () => {
    const auth = getClientAuth();
    if (auth) await fbSignOut(auth);
    await syncSession(null);
    setProfile(null);
  }, []);

  const refresh = useCallback(async () => {
    const auth = getClientAuth();
    const db = getClientDb();
    if (auth?.currentUser) {
      await auth.currentUser.getIdToken(true);
      await syncSession(auth.currentUser);
      if (db) {
        const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (snap.exists()) setProfile({ uid: auth.currentUser.uid, ...snap.data() } as AppUser);
      }
    }
  }, []);

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    configured: firebaseConfigured,
    role: profile?.role ?? "customer",
    proStatus: profile?.proStatus ?? "none",
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
