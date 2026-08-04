import "server-only";
import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

/** True when a real Stripe secret key is configured. */
export const stripeConfigured = Boolean(
  secretKey && secretKey.startsWith("sk_") && !secretKey.includes("placeholder"),
);

let stripeInstance: Stripe | null = null;

/** Returns the Stripe client, or null if not configured (graceful degradation). */
export function getStripe(): Stripe | null {
  if (!stripeConfigured) return null;
  if (!stripeInstance) {
    // No apiVersion override: the SDK uses its pinned default / the account version.
    stripeInstance = new Stripe(secretKey as string, {
      appInfo: { name: "Amethyste Storefront" },
    });
  }
  return stripeInstance;
}
