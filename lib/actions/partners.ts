"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "../firebase/admin";
import type { Firestore } from "firebase-admin/firestore";
import { partnersCol, partnersMetaDoc } from "../firebase/collections";
import { SEED_PARTNERS } from "../data/seed";
import { verifySession } from "../auth/dal";

async function requireAdmin() {
  const viewer = await verifySession();
  if (!viewer || viewer.role !== "admin") throw new Error("forbidden");
}

const partnerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  logo: z.string().default(""),
  href: z.string().url().or(z.literal("")).default(""),
  roleFr: z.string().default(""),
  roleEn: z.string().default(""),
  descFr: z.string().default(""),
  descEn: z.string().default(""),
  ctaFr: z.string().default(""),
  ctaEn: z.string().default(""),
  active: z.boolean().default(true),
  sortOrder: z.number().default(99),
});

export type PartnerFormInput = z.input<typeof partnerSchema>;

function revalidatePublic() {
  revalidatePath("/admin/partenaires");
  revalidatePath("/", "layout"); // landing page reads partners
}

/**
 * While the collection is empty the site shows SEED_PARTNERS, which don't
 * exist in Firestore — deleting or editing them would be a no-op and they'd
 * come back on reload. Materialize them once, then mark the collection as
 * initialized so an empty list stays empty.
 */
async function ensurePartnersInitialized(db: Firestore) {
  const metaRef = partnersMetaDoc(db);
  const meta = await metaRef.get();
  if (meta.exists) return;

  const existing = await partnersCol(db).limit(1).get();
  const batch = db.batch();
  if (existing.empty) {
    for (const sp of SEED_PARTNERS) {
      batch.set(partnersCol(db).doc(sp.id), {
        name: sp.name,
        logo: sp.logo,
        href: sp.href,
        role: sp.role,
        desc: sp.desc,
        cta: sp.cta,
        active: sp.active,
        sortOrder: sp.sortOrder,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  }
  batch.set(metaRef, { initialized: true, at: FieldValue.serverTimestamp() });
  await batch.commit();
}

export async function upsertPartner(input: PartnerFormInput) {
  await requireAdmin();
  const db = getAdminDb();
  if (!db) return { ok: false as const, error: "not-configured" };

  const parsed = partnerSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "invalid" };
  const p = parsed.data;

  await ensurePartnersInitialized(db);

  const doc = {
    name: p.name,
    logo: p.logo,
    href: p.href,
    role: { fr: p.roleFr, en: p.roleEn },
    desc: { fr: p.descFr, en: p.descEn },
    cta: { fr: p.ctaFr, en: p.ctaEn },
    active: p.active,
    sortOrder: p.sortOrder,
    updatedAt: FieldValue.serverTimestamp(),
  };

  let id = p.id;
  if (id) {
    await partnersCol(db).doc(id).set(doc, { merge: true });
  } else {
    const created = await partnersCol(db).add({ ...doc, createdAt: FieldValue.serverTimestamp() });
    id = created.id;
  }

  revalidatePublic();
  return { ok: true as const, id };
}

export async function deletePartner(id: string) {
  await requireAdmin();
  const db = getAdminDb();
  if (!db) return { ok: false as const, error: "not-configured" };
  if (!id) return { ok: false as const, error: "invalid" };
  await ensurePartnersInitialized(db);
  await partnersCol(db).doc(id).delete();
  revalidatePublic();
  return { ok: true as const };
}
