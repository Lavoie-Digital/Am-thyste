"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import {
  onIdTokenChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
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
  resetPassword: (email: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Outcome of exchanging the Firebase ID token for the server session cookie.
 *  - "ok"          → the HttpOnly cookie is set, server components can see the viewer
 *  - "auth-failed" → the credential itself is dead (refresh token revoked after a
 *                    password change, account disabled, token rejected). The client
 *                    must stop pretending to be signed in.
 *  - "unavailable" → transient/network/server problem. Keep the client session.
 */
type SyncResult = "ok" | "auth-failed" | "unavailable";

/** POST the fresh ID token to the server so it can mint a session cookie. */
async function syncSession(fbUser: FirebaseUser | null): Promise<SyncResult> {
  if (!fbUser) {
    try {
      await fetch("/api/session", { method: "DELETE" });
    } catch {
      /* the cookie also expires on its own; nothing actionable client-side */
    }
    return "ok";
  }

  let idToken: string;
  try {
    idToken = await fbUser.getIdToken();
  } catch (err) {
    // getIdToken() failing means the refresh token no longer works — this is
    // what happens to an open tab after the password is changed elsewhere.
    console.error("[auth] could not refresh ID token:", err);
    return "auth-failed";
  }

  try {
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (res.status === 401) return "auth-failed";
    if (!res.ok) return "unavailable";
    // `adminConfigured === false` answers 200 with { ok: false } — the client is
    // usable but there is no server session, so guarded pages will still bounce.
    const body = await res.json().catch(() => null);
    if (body && body.ok === false) return "unavailable";
    return "ok";
  } catch (err) {
    console.error("[auth] session sync failed:", err);
    return "unavailable";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(firebaseConfigured);
  // Tracks the last-seen role/proStatus so an admin approval propagates live.
  const gatingRef = useRef<string | null>(null);

  useEffect(() => {
    const auth = getClientAuth();
    if (!auth) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    const unsub = onIdTokenChanged(auth, async (fbUser) => {
      const result = await syncSession(fbUser);
      if (result === "auth-failed" && fbUser) {
        // The cached credential is dead. Leaving `user` set here is what made a
        // stale tab show the "Déconnexion" button while every protected page
        // redirected back to the login form.
        setUser(null);
        setProfile(null);
        setLoading(false);
        await fbSignOut(auth);
        return;
      }
      setUser(fbUser);
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

  // When the viewer's role/proStatus changes (e.g. an admin just approved this
  // pro account), refresh the ID token so claims are current and re-render
  // server components so professional pricing shows without a manual reload.
  useEffect(() => {
    if (!profile) {
      gatingRef.current = null;
      return;
    }
    const key = `${profile.role}:${profile.proStatus}`;
    if (gatingRef.current === null) {
      // First profile snapshot — capture the baseline, don't refresh.
      gatingRef.current = key;
      return;
    }
    if (gatingRef.current !== key) {
      gatingRef.current = key;
      (async () => {
        const auth = getClientAuth();
        if (auth?.currentUser) {
          await auth.currentUser.getIdToken(true);
          await syncSession(auth.currentUser);
        }
        router.refresh();
      })();
    }
  }, [profile, router]);

  const signIn = useCallback(async (email: string, password: string) => {
    const auth = getClientAuth();
    if (!auth) throw new Error("not-configured");
    const cred = await signInWithEmailAndPassword(auth, email, password);
    // Credentials were accepted, but without the server cookie every guarded
    // page bounces straight back to this form. Fail loudly instead of handing
    // the caller a "successful" login that goes nowhere.
    const result = await syncSession(cred.user);
    if (result !== "ok") throw new Error("session-failed");
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
    const result = await syncSession(cred.user);
    if (result !== "ok") throw new Error("session-failed");
    return cred.user;
  }, []);

  const signOut = useCallback(async () => {
    const auth = getClientAuth();
    if (auth) await fbSignOut(auth);
    await syncSession(null);
    setProfile(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const auth = getClientAuth();
    if (!auth) throw new Error("not-configured");
    await sendPasswordResetEmail(auth, email);
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
    resetPassword,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
