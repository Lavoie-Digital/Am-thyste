import "server-only";
import { cache } from "react";
import type { Product, ProductDTO, Viewer } from "../types";
import { getAdminDb, adminConfigured } from "../firebase/admin";
import { productsCol } from "../firebase/collections";
import { SEED_PRODUCTS } from "./seed";
import { pricingContextFor } from "../pricing";

/** Firestore Timestamp → epoch ms (plain number, safe to serialize to client). */
function toMs(v: unknown): number {
  if (typeof v === "number") return v;
  const ts = v as { toMillis?: () => number } | undefined;
  return ts && typeof ts.toMillis === "function" ? ts.toMillis() : 0;
}

/** Raw product read: Firestore when configured, otherwise the seed catalog. */
const getRawProducts = cache(async (): Promise<Product[]> => {
  const db = getAdminDb();
  if (!adminConfigured || !db) {
    return [...SEED_PRODUCTS].sort((a, b) => a.sortOrder - b.sortOrder);
  }
  try {
    const snap = await productsCol(db).orderBy("sortOrder").get();
    if (snap.empty) return [...SEED_PRODUCTS].sort((a, b) => a.sortOrder - b.sortOrder);
    return snap.docs.map((d) => {
      const data = d.data() as Omit<Product, "id">;
      // Normalize Firestore Timestamps to plain numbers for RSC serialization.
      return { ...data, id: d.id, createdAt: toMs(data.createdAt), updatedAt: toMs(data.updatedAt) };
    });
  } catch (err) {
    console.error("[products] Firestore read failed, falling back to seed:", err);
    return [...SEED_PRODUCTS].sort((a, b) => a.sortOrder - b.sortOrder);
  }
});

/**
 * Converts a full Product into a client-safe DTO. The reseller price is ONLY
 * included for approved pros / admins — never serialized otherwise. This is the
 * server-side enforcement that prevents reseller-price leakage.
 */
export function toDTO(product: Product, viewer: Viewer | null): ProductDTO {
  // Pro-only products are never sold at market rate — their reseller price is
  // their ONLY price (marketPrice is typically 0), so there is no pro discount
  // to hide. Expose it to everyone so the public preview shows a real price;
  // purchase is still blocked for non-pros (AddToCartButton + priceCart()).
  const canSeeReseller = pricingContextFor(viewer) === "reseller" || !!product.proOnly;
  return {
    id: product.id,
    slug: product.slug,
    active: product.active,
    name: product.name,
    shortDesc: product.shortDesc,
    description: product.description,
    ritual: product.ritual,
    ingredients: product.ingredients,
    marketPrice: product.marketPrice,
    ...(canSeeReseller ? { resellerPrice: product.resellerPrice } : {}),
    proOnly: product.proOnly ?? false,
    currency: product.currency,
    images: product.images,
    sizes: product.sizes.map((s) => ({
      id: s.id,
      label: s.label,
      marketPrice: s.marketPrice,
      ...(canSeeReseller ? { resellerPrice: s.resellerPrice } : {}),
      sku: s.sku,
    })),
    category: product.category,
    sortOrder: product.sortOrder,
  };
}

/**
 * Active products as client-safe DTOs for the given viewer. Pro-only products
 * are listed for everyone (public preview), but only approved pros / admins can
 * buy them: the add-to-cart button is swapped for a sign-in prompt, and
 * priceCart() rejects them server-side at checkout.
 */
export async function getProducts(viewer: Viewer | null): Promise<ProductDTO[]> {
  const products = await getRawProducts();
  // Pro-only products always come last (stable sort keeps sortOrder within each group).
  return products
    .filter((p) => p.active)
    .sort((a, b) => Number(!!a.proOnly) - Number(!!b.proOnly))
    .map((p) => toDTO(p, viewer));
}

/** A single product by slug as a client-safe DTO, or null. */
export async function getProduct(
  slug: string,
  viewer: Viewer | null,
): Promise<ProductDTO | null> {
  const products = await getRawProducts();
  const product = products.find((p) => p.slug === slug && p.active);
  if (!product) return null;
  return toDTO(product, viewer);
}

/** Raw products including inactive — admin/dashboard only. Caller must gate. */
export async function getAllProductsRaw(): Promise<Product[]> {
  return getRawProducts();
}

/** Raw single product by id — admin/dashboard + server checkout. Caller must gate. */
export async function getProductByIdRaw(id: string): Promise<Product | null> {
  const products = await getRawProducts();
  return products.find((p) => p.id === id) ?? null;
}
