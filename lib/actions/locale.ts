"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LOCALE_COOKIE, normalizeLocale } from "../i18n/config";

/** Set the locale cookie and re-render server components with the new dictionary. */
export async function setLocale(locale: string) {
  const value = normalizeLocale(locale);
  const store = await cookies();
  store.set(LOCALE_COOKIE, value, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
