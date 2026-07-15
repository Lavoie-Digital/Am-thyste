import "server-only";
import { cache } from "react";
import type { Partner } from "../types";
import { getAdminDb, adminConfigured } from "../firebase/admin";
import { partnersCol } from "../firebase/collections";
import { SEED_PARTNERS } from "./seed";

/** Firestore Timestamp → epoch ms (plain number, safe to serialize to client). */
function toMs(v: unknown): number {
  if (typeof v === "number") return v;
  const ts = v as { toMillis?: () => number } | undefined;
  return ts && typeof ts.toMillis === "function" ? ts.toMillis() : 0;
}

/** Raw partner read: Firestore when configured, otherwise the seed list. */
const getRawPartners = cache(async (): Promise<Partner[]> => {
  const db = getAdminDb();
  if (!adminConfigured || !db) {
    return [...SEED_PARTNERS].sort((a, b) => a.sortOrder - b.sortOrder);
  }
  try {
    const snap = await partnersCol(db).orderBy("sortOrder").get();
    if (snap.empty) return [...SEED_PARTNERS].sort((a, b) => a.sortOrder - b.sortOrder);
    return snap.docs.map((d) => {
      const data = d.data() as Omit<Partner, "id">;
      return { ...data, id: d.id, createdAt: toMs(data.createdAt), updatedAt: toMs(data.updatedAt) };
    });
  } catch (err) {
    console.error("[partners] Firestore read failed, falling back to seed:", err);
    return [...SEED_PARTNERS].sort((a, b) => a.sortOrder - b.sortOrder);
  }
});

/** Active partners for the public landing page, ordered. */
export async function getPartners(): Promise<Partner[]> {
  const partners = await getRawPartners();
  return partners.filter((p) => p.active);
}

/** All partners including inactive — admin only. Caller must gate. */
export async function getAllPartnersRaw(): Promise<Partner[]> {
  return getRawPartners();
}
