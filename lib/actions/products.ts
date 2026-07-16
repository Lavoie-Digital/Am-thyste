"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "../firebase/admin";
import { productsCol } from "../firebase/collections";
import { verifySession } from "../auth/dal";
import { slugify } from "../utils";
import type { ProductCategory } from "../types";

async function requireAdmin() {
  const viewer = await verifySession();
  if (!viewer || viewer.role !== "admin") throw new Error("forbidden");
}

const productSchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  active: z.boolean().default(true),
  nameFr: z.string().min(1),
  nameEn: z.string().min(1),
  shortDescFr: z.string().default(""),
  shortDescEn: z.string().default(""),
  descFr: z.string().default(""),
  descEn: z.string().default(""),
  ritualFr: z.string().default(""),
  ritualEn: z.string().default(""),
  ingredientsFr: z.string().default(""),
  ingredientsEn: z.string().default(""),
  // Prices arrive in dollars from the form; stored as integer cents.
  marketPrice: z.number().nonnegative(),
  resellerPrice: z.number().nonnegative(),
  proOnly: z.boolean().default(false),
  images: z.array(z.string()).default([]),
  sizeLabelFr: z.string().default(""),
  sizeLabelEn: z.string().default(""),
  category: z.string().default("other"),
  sortOrder: z.number().default(99),
  // The document version the editor loaded — used for optimistic-locking so two
  // admins saving at once can't silently clobber each other's changes.
  version: z.number().int().nonnegative().optional(),
});

export type ProductFormInput = z.input<typeof productSchema>;

export async function upsertProduct(input: ProductFormInput) {
  await requireAdmin();
  const db = getAdminDb();
  if (!db) return { ok: false, error: "not-configured" };

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const p = parsed.data;

  const slug = p.slug || slugify(p.nameFr || p.nameEn);
  const doc = {
    slug,
    active: p.active,
    name: { fr: p.nameFr, en: p.nameEn },
    shortDesc: { fr: p.shortDescFr, en: p.shortDescEn },
    description: { fr: p.descFr, en: p.descEn },
    ...(p.ritualFr || p.ritualEn ? { ritual: { fr: p.ritualFr, en: p.ritualEn } } : {}),
    ...(p.ingredientsFr || p.ingredientsEn
      ? { ingredients: { fr: p.ingredientsFr, en: p.ingredientsEn } }
      : {}),
    marketPrice: Math.round(p.marketPrice * 100),
    resellerPrice: Math.round(p.resellerPrice * 100),
    proOnly: p.proOnly,
    currency: "cad" as const,
    images: p.images.filter(Boolean),
    sizes:
      p.sizeLabelFr || p.sizeLabelEn
        ? [{ id: "default", label: { fr: p.sizeLabelFr, en: p.sizeLabelEn } }]
        : [],
    category: p.category as ProductCategory,
    sortOrder: p.sortOrder,
    updatedAt: FieldValue.serverTimestamp(),
  };

  // New products are simply created with version 1.
  if (!p.id) {
    const created = await productsCol(db)
      .add({ ...doc, version: 1, createdAt: FieldValue.serverTimestamp() });
    revalidatePath("/tableau-de-bord/produits");
    revalidatePath("/boutique");
    revalidatePath("/");
    return { ok: true, slug, id: created.id };
  }

  // Existing products: run inside a transaction with optimistic locking so two
  // admins editing simultaneously can never silently overwrite (or wipe) each
  // other's changes. The second save fails cleanly and is asked to reload.
  const ref = productsCol(db).doc(p.id);
  const expected = p.version ?? 0;
  try {
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) {
        // First-time persistence of a seed/legacy product — create it fresh.
        tx.set(ref, { ...doc, version: 1, createdAt: FieldValue.serverTimestamp() });
        return;
      }
      const current = (snap.data()?.version as number | undefined) ?? 0;
      if (current !== expected) {
        // Someone else saved after this editor loaded the product.
        throw new Error("conflict");
      }
      tx.set(ref, { ...doc, version: current + 1 }, { merge: true });
    });
  } catch (err) {
    if ((err as Error).message === "conflict") return { ok: false, error: "conflict" };
    throw err;
  }

  revalidatePath("/tableau-de-bord/produits");
  revalidatePath("/boutique");
  revalidatePath("/");
  return { ok: true, slug };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const db = getAdminDb();
  if (!db) return { ok: false, error: "not-configured" };
  await productsCol(db).doc(id).delete();
  revalidatePath("/tableau-de-bord/produits");
  revalidatePath("/boutique");
  return { ok: true };
}
