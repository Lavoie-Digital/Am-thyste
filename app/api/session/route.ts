import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb, adminConfigured } from "@/lib/firebase/admin";
import { usersCol } from "@/lib/firebase/collections";
import { SESSION_COOKIE } from "@/lib/auth/dal";
import { isAllowlistedAdmin } from "@/lib/auth/admin-allowlist";

// 5 days, in ms (Firebase session cookie max is 14 days).
const EXPIRES_IN = 60 * 60 * 24 * 5 * 1000;

/** Grant admin (claims + Firestore profile) to allowlisted staff emails, once. */
async function ensureAllowlistedAdmin(uid: string, email: string, name: string) {
  const auth = getAdminAuth();
  const db = getAdminDb();
  if (!auth || !db) return;
  const ref = usersCol(db).doc(uid);
  const snap = await ref.get();
  if (snap.exists && (snap.data() as { role?: string }).role === "admin") return; // already admin
  await auth.setCustomUserClaims(uid, { role: "admin", proStatus: "none" });
  await ref.set(
    {
      uid,
      email,
      displayName: name || email,
      role: "admin",
      proStatus: "none",
      ...(snap.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
    },
    { merge: true },
  );
}

/** Exchange a Firebase ID token for an HttpOnly session cookie. */
export async function POST(request: NextRequest) {
  if (!adminConfigured) {
    // Graceful no-op: the client still works, just without a server session.
    return NextResponse.json({ ok: false, reason: "admin-not-configured" });
  }
  const auth = getAdminAuth();
  if (!auth) return NextResponse.json({ ok: false }, { status: 503 });

  let idToken: string | undefined;
  try {
    ({ idToken } = await request.json());
  } catch {
    return NextResponse.json({ ok: false, error: "bad-request" }, { status: 400 });
  }
  if (!idToken) return NextResponse.json({ ok: false, error: "missing-token" }, { status: 400 });

  try {
    // Auto-promote allowlisted staff emails to admin on login.
    try {
      const decoded = await auth.verifyIdToken(idToken);
      if (isAllowlistedAdmin(decoded.email)) {
        await ensureAllowlistedAdmin(decoded.uid, decoded.email ?? "", decoded.name ?? "");
      }
    } catch (err) {
      console.error("[session] admin allowlist check failed:", err);
    }

    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: EXPIRES_IN });
    const store = await cookies();
    store.set(SESSION_COOKIE, sessionCookie, {
      maxAge: EXPIRES_IN / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[session] failed to mint cookie:", err);
    return NextResponse.json({ ok: false, error: "invalid-token" }, { status: 401 });
  }
}

/** Clear the session cookie (logout). */
export async function DELETE() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
