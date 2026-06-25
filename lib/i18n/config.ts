import type { Locale } from "../types";

export const locales: Locale[] = ["fr", "en"];
export const defaultLocale: Locale = "fr";
export const LOCALE_COOKIE = "amethyste_locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "fr" || value === "en";
}

export function normalizeLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : defaultLocale;
}
