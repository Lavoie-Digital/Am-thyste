import "server-only";

/**
 * Email allowlist that is auto-granted the `admin` role on login.
 * Configured via the ADMIN_EMAILS env var (comma-separated). Matching is
 * case-insensitive. This lets staff become admins the first time they sign in
 * (including via Google), without pre-creating accounts or sharing passwords.
 */
const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

export function isAllowlistedAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.has(email.trim().toLowerCase());
}
