import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminAuth, getAdminDb, adminConfigured } from "../firebase/admin";
import { usersCol } from "../firebase/collections";
import type { ProStatus, UserRole, Viewer, AppUser } from "../types";

export const SESSION_COOKIE = "session";

/**
 * The authoritative server-side viewer. Reads the HttpOnly session cookie,
 * verifies it with Firebase Admin, then resolves role/proStatus from custom
 * claims (falling back to the Firestore user doc). Cached per request.
 *
 * Returns null when there is no valid session, or when Firebase Admin isn't
 * configured (placeholder keys) — in that case the app runs in public mode.
 */
export const verifySession = cache(async (): Promise<Viewer | null> => {
  if (!adminConfigured) return null;
  const auth = getAdminAuth();
  if (!auth) return null;

  const store = await cookies();
  const sessionCookie = store.get(SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await auth.verifySessionCookie(sessionCookie, true);

    let role = (decoded.role as UserRole) ?? "customer";
    let proStatus = (decoded.proStatus as ProStatus) ?? "none";

    // Firestore profile is the source of truth if claims are stale/missing.
    const db = getAdminDb();
    if (db) {
      try {
        const snap = await usersCol(db).doc(decoded.uid).get();
        if (snap.exists) {
          const data = snap.data() as AppUser;
          role = data.role ?? role;
          proStatus = data.proStatus ?? proStatus;
        }
      } catch {
        /* fall back to claims */
      }
    }

    return {
      uid: decoded.uid,
      email: decoded.email ?? "",
      role,
      proStatus,
    };
  } catch {
    return null;
  }
});

/** Redirect to login unless a viewer is present. Returns the viewer. */
export async function requireUser(redirectTo = "/pro/connexion"): Promise<Viewer> {
  const viewer = await verifySession();
  if (!viewer) redirect(redirectTo);
  return viewer;
}

/** Redirect unless the viewer has the given role (admin == owner). */
export async function requireRole(
  role: UserRole,
  redirectTo = "/pro/connexion",
): Promise<Viewer> {
  const viewer = await verifySession();
  if (!viewer) redirect(redirectTo);
  if (viewer.role !== role) redirect("/");
  return viewer;
}

/** Returns true when the viewer may see reseller pricing. */
export function isApprovedPro(viewer: Viewer | null): boolean {
  if (!viewer) return false;
  return viewer.role === "admin" || (viewer.role === "pro" && viewer.proStatus === "approved");
}
