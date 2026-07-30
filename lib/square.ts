import "server-only";

const accessToken = process.env.SQUARE_ACCESS_TOKEN;
const locationId = process.env.SQUARE_LOCATION_ID;
const env = process.env.SQUARE_ENV === "sandbox" ? "sandbox" : "production";

const BASE_URL =
  env === "sandbox" ? "https://connect.squareupsandbox.com" : "https://connect.squareup.com";

// Pinned explicitly per Square's API versioning scheme; bump deliberately after testing.
const SQUARE_API_VERSION = "2024-10-17";

/** True when real Square credentials are configured. */
export const squareConfigured = Boolean(
  accessToken && !accessToken.includes("placeholder") && locationId && !locationId.includes("placeholder"),
);

export function squareLocationId(): string {
  return locationId ?? "";
}

/**
 * Thin fetch wrapper against Square's REST API — no SDK dependency, mirrors the
 * graceful-degradation pattern used for Stripe/SendGrid/Firebase in this project.
 */
export async function squareFetch<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<{ ok: boolean; status: number; data: T | null }> {
  if (!squareConfigured) return { ok: false, status: 0, data: null };
  const res = await fetch(`${BASE_URL}${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Square-Version": SQUARE_API_VERSION,
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const data = (await res.json().catch(() => null)) as T | null;
  return { ok: res.ok, status: res.status, data };
}
