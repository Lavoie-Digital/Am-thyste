"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "../firebase/admin";
import { partnersCol } from "../firebase/collections";
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

export async function upsertPartner(input: PartnerFormInput) {
  await requireAdmin();
  const db = getAdminDb();
  if (!db) return { ok: false as const, error: "not-configured" };

  const parsed = partnerSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "invalid" };
  const p = parsed.data;

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
  await partnersCol(db).doc(id).delete();
  revalidatePublic();
  return { ok: true as const };
}
