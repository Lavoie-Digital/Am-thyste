import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth, adminConfigured } from "@/lib/firebase/admin";
import { SESSION_COOKIE } from "@/lib/auth/dal";

// 5 days, in ms (Firebase session cookie max is 14 days).
const EXPIRES_IN = 60 * 60 * 24 * 5 * 1000;

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
