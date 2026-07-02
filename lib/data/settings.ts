import "server-only";
import { cache } from "react";
import type { Settings } from "../types";
import { getAdminDb, adminConfigured } from "../firebase/admin";
import { settingsDoc } from "../firebase/collections";
import { SEED_SETTINGS } from "./seed";

/** Global store settings: Firestore when configured, else seed defaults. */
export const getSettings = cache(async (): Promise<Settings> => {
  const db = getAdminDb();
  if (!adminConfigured || !db) return SEED_SETTINGS;
  try {
    const doc = await settingsDoc(db).get();
    if (!doc.exists) return SEED_SETTINGS;
    return { ...SEED_SETTINGS, ...(doc.data() as Partial<Settings>) };
  } catch (err) {
    console.error("[settings] Firestore read failed, using defaults:", err);
    return SEED_SETTINGS;
  }
});

/**
 * Recipient for owner-facing notifications (new pro request, contact message).
 * Prefers SENDGRID_OWNER_EMAIL (handy for testing), else the store contactEmail.
 */
export async function getOwnerEmail(): Promise<string> {
  const override = process.env.SENDGRID_OWNER_EMAIL?.trim();
  if (override) return override;
  const settings = await getSettings();
  return settings.contactEmail;
}

/** Compute shipping (cents) from a subtotal against the configured threshold. */
export function computeShipping(subtotal: number, settings: Settings): number {
  if (subtotal <= 0) return 0;
  return subtotal >= settings.freeShippingThreshold ? 0 : settings.flatShippingRate;
}
