import "server-only";
import { cache } from "react";
import type { Settings } from "../types";
import { getAdminDb, adminConfigured } from "../firebase/admin";
import { settingsDoc } from "../firebase/collections";
import { SEED_SETTINGS } from "./seed";
import { normalizeRecipients } from "../email/recipients";

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
 * Recipients for owner-facing notifications (new order, pro request, contact
 * message). SENDGRID_OWNER_EMAIL wins when set and accepts several addresses
 * separated by commas — that's how a second person (ex. la gestionnaire) gets
 * copied on every automated notice without touching the code. Falls back to the
 * store contactEmail from the settings document.
 */
export async function getOwnerEmails(): Promise<string[]> {
  const override = process.env.SENDGRID_OWNER_EMAIL ?? "";
  const fromEnv = normalizeRecipients(override.split(","));
  if (fromEnv.length > 0) return fromEnv;
  const settings = await getSettings();
  return normalizeRecipients(settings.contactEmail ?? "");
}

/** Compute shipping (cents) from a subtotal against the configured threshold. */
export function computeShipping(subtotal: number, settings: Settings): number {
  if (subtotal <= 0) return 0;
  return subtotal >= settings.freeShippingThreshold ? 0 : settings.flatShippingRate;
}
