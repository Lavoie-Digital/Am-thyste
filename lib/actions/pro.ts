"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "../firebase/admin";
import { usersCol } from "../firebase/collections";
import { verifySession } from "../auth/dal";
import { getLocale } from "../i18n/server";
import { sendEmail } from "../email/sendgrid";
import { proApprovedEmail, proRejectedEmail } from "../email/templates";
import type { AppUser, ProStatus } from "../types";

async function requireAdmin() {
  const viewer = await verifySession();
  if (!viewer || viewer.role !== "admin") throw new Error("forbidden");
  return viewer;
}

async function setProStatus(uid: string, status: ProStatus) {
  await requireAdmin();
  const db = getAdminDb();
  const auth = getAdminAuth();
  if (!db || !auth) return { ok: false, error: "not-configured" };

  const ref = usersCol(db).doc(uid);
  const snap = await ref.get();
  if (!snap.exists) return { ok: false, error: "not-found" };
  const user = snap.data() as AppUser;

  await ref.update({
    proStatus: status,
    role: status === "approved" ? "pro" : user.role,
    ...(status === "approved"
      ? { approvedAt: FieldValue.serverTimestamp() }
      : {}),
  });

  // Mirror into custom claims so the session token carries authorization.
  await auth.setCustomUserClaims(uid, {
    role: status === "approved" ? "pro" : user.role === "admin" ? "admin" : "customer",
    proStatus: status,
  });

  // Notify the applicant.
  const locale = await getLocale();
  const name = user.displayName || user.email;
  const mail = status === "approved" ? proApprovedEmail(name, locale) : proRejectedEmail(name, locale);
  await sendEmail({ to: user.email, subject: mail.subject, html: mail.html });

  revalidatePath("/admin/pros");
  return { ok: true };
}

export async function approvePro(uid: string) {
  return setProStatus(uid, "approved");
}

export async function rejectPro(uid: string) {
  return setProStatus(uid, "rejected");
}
