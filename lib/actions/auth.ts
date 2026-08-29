"use server";

import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb, adminConfigured } from "../firebase/admin";
import { usersCol } from "../firebase/collections";
import { verifySession } from "../auth/dal";
import { getLocale } from "../i18n/server";
import { getOwnerEmail } from "../data/settings";
import { sendEmail } from "../email/sendgrid";
import {
  welcomeEmail,
  proApplicationAckEmail,
  proApplicationOwnerEmail,
} from "../email/templates";
import type { AppUser } from "../types";

const proProfileSchema = z.object({
  businessName: z.string().min(1),
  diplomaUrl: z.string().url(),
  phone: z.string().min(1),
  line1: z.string().min(1),
  city: z.string().min(1),
  province: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1).default("Canada"),
});

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/**
 * Creates (or updates) the Firestore user profile after a client-side Firebase
 * signup. Identity comes from the verified session cookie — never trusted from
 * the client. `applyAsPro` flags the account for admin approval.
 */
export async function createProfile(input: {
  displayName: string;
  applyAsPro?: boolean;
  pro?: z.input<typeof proProfileSchema>;
}): Promise<ActionResult> {
  if (!adminConfigured) {
    return { ok: false, error: "not-configured" };
  }
  const viewer = await verifySession();
  if (!viewer) return { ok: false, error: "unauthenticated" };

  const db = getAdminDb();
  if (!db) return { ok: false, error: "not-configured" };

  const ref = usersCol(db).doc(viewer.uid);
  const existing = await ref.get();
  const prev = existing.exists ? (existing.data() as AppUser) : null;

  // Never let a profile downgrade an admin or re-trigger on existing accounts.
  const baseRole = prev?.role ?? "customer";
  const baseStatus = prev?.proStatus ?? "none";
  if (baseRole === "admin") {
    return { ok: true };
  }

  let proFields: Partial<AppUser> = {};
  if (input.applyAsPro && input.pro) {
    const parsed = proProfileSchema.safeParse(input.pro);
    if (!parsed.success) return { ok: false, error: "invalid-pro-profile" };
    const p = parsed.data;
    proFields = {
      role: "pro",
      proStatus: "pending",
      proProfile: {
        businessName: p.businessName,
        diplomaUrl: p.diplomaUrl,
        phone: p.phone,
        address: {
          line1: p.line1,
          city: p.city,
          province: p.province,
          postalCode: p.postalCode,
          country: p.country,
        },
      },
    };
  }

  // An already-approved pro must never be knocked back to "pending" by a
  // re-submission, and a plain profile-touch (the Google sign-in path calls this
  // with no pro payload) must never demote an existing pro/approved account to
  // customer/none. Only ever move *up* from what is already on the document.
  const nextRole = baseRole === "pro" ? "pro" : (proFields.role ?? baseRole);
  const nextStatus =
    baseStatus === "approved" ? "approved" : (proFields.proStatus ?? baseStatus);

  const data = {
    uid: viewer.uid,
    email: viewer.email,
    displayName: input.displayName || prev?.displayName || viewer.email,
    role: nextRole,
    proStatus: nextStatus,
    ...(proFields.proProfile ? { proProfile: proFields.proProfile } : {}),
    ...(existing.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
  };

  await ref.set(data, { merge: true });

  // Mirror role/proStatus into the custom claims so the ID token and the
  // Firestore document can't drift apart (the DAL reads the document first, but
  // anything reading claims — e.g. Firestore security rules — needs them too).
  const auth = getAdminAuth();
  if (auth) {
    try {
      await auth.setCustomUserClaims(viewer.uid, {
        role: nextRole,
        proStatus: nextStatus,
      });
    } catch (err) {
      console.error("[auth] failed to sync custom claims:", err);
    }
  }

  const locale = await getLocale();
  const name = input.displayName || prev?.displayName || viewer.email;

  if (proFields.proProfile) {
    // A pro application was just filed. This must fire even when the Firestore
    // document already existed — an existing customer applying from a signed-in
    // session is the common case, and gating these on `!existing.exists` meant
    // the owner was never notified of their request.
    const ack = proApplicationAckEmail(name, locale);
    const owner = proApplicationOwnerEmail({
      name,
      email: viewer.email,
      profile: proFields.proProfile,
    });
    const ownerEmail = await getOwnerEmail();
    await Promise.all([
      sendEmail({ to: viewer.email, subject: ack.subject, html: ack.html }),
      sendEmail({ to: ownerEmail, subject: owner.subject, html: owner.html, replyTo: viewer.email }),
    ]);
  } else if (!existing.exists) {
    const mail = welcomeEmail(name, locale);
    await sendEmail({ to: viewer.email, subject: mail.subject, html: mail.html });
  }

  return { ok: true };
}
