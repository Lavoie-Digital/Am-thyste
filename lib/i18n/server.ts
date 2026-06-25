import "server-only";
import { cookies } from "next/headers";
import type { Locale } from "../types";
import { LOCALE_COOKIE, normalizeLocale } from "./config";
import { getDictionary, type Dictionary } from "./dictionaries";

/** Read the current locale from the cookie (Next 16: cookies() is async). */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return normalizeLocale(store.get(LOCALE_COOKIE)?.value);
}

/** Convenience: returns both the locale and its dictionary for server components. */
export async function getI18n(): Promise<{ locale: Locale; dict: Dictionary }> {
  const locale = await getLocale();
  return { locale, dict: getDictionary(locale) };
}
