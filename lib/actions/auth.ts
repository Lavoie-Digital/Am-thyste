"use server";

import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, adminConfigured } from "../firebase/admin";
import { usersCol } from "../firebase/collections";
import { verifySession } from "../auth/dal";
import { getLocale } from "../i18n/server";
import { sendEmail } from "../email/sendgrid";
import { welcomeEmail } from "../email/templates";
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

  // Never let a profile downgrade an admin or re-trigger on existing accounts.
  const baseRole = existing.exists ? (existing.data() as AppUser).role : "customer";
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

  const data = {
    uid: viewer.uid,
    email: viewer.email,
    displayName: input.displayName || viewer.email,
    role: proFields.role ?? "customer",
    proStatus: proFields.proStatus ?? "none",
    ...(proFields.proProfile ? { proProfile: proFields.proProfile } : {}),
    ...(existing.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
  };

  await ref.set(data, { merge: true });

  if (!existing.exists) {
    const locale = await getLocale();
    const mail = welcomeEmail(input.displayName || viewer.email, locale);
    await sendEmail({ to: viewer.email, subject: mail.subject, html: mail.html });
  }

  return { ok: true };
}
