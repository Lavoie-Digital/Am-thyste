"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getAdminDb } from "../firebase/admin";
import { settingsDoc } from "../firebase/collections";
import { verifySession } from "../auth/dal";

const schema = z.object({
  freeShippingThreshold: z.number().nonnegative(), // dollars → cents
  flatShippingRate: z.number().nonnegative(),
  contactEmail: z.string().email(),
  instagram: z.string().optional().default(""),
  facebook: z.string().optional().default(""),
});

export type SettingsFormInput = z.input<typeof schema>;

export async function updateSettings(input: SettingsFormInput) {
  const viewer = await verifySession();
  if (!viewer || viewer.role !== "admin") throw new Error("forbidden");
  const db = getAdminDb();
  if (!db) return { ok: false, error: "not-configured" };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const s = parsed.data;

  await settingsDoc(db).set(
    {
      freeShippingThreshold: Math.round(s.freeShippingThreshold * 100),
      flatShippingRate: Math.round(s.flatShippingRate * 100),
      contactEmail: s.contactEmail,
      social: { instagram: s.instagram || undefined, facebook: s.facebook || undefined },
    },
    { merge: true },
  );

  revalidatePath("/tableau-de-bord/parametres");
  revalidatePath("/", "layout");
  return { ok: true };
}
