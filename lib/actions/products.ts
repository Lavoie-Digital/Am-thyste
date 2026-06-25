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
  images: z.array(z.string()).default([]),
  sizeLabelFr: z.string().default(""),
  sizeLabelEn: z.string().default(""),
  category: z.string().default("other"),
  sortOrder: z.number().default(99),
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

  if (p.id) {
    await productsCol(db).doc(p.id).set(doc, { merge: true });
  } else {
    await productsCol(db).add({ ...doc, createdAt: FieldValue.serverTimestamp() });
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
