/**
 * Loyalty points rules — single source of truth.
 *   • Earn:   1 point per $1 spent (on the order subtotal).
 *   • Redeem: 100 points = $10 off  →  1 point = 1¢ of discount... no:
 *             100 points = 1000¢, so each point is worth 10¢ and redemption
 *             happens in blocks of 100 points ($10).
 */

export const REDEEM_BLOCK_POINTS = 100; // points per redemption block
export const REDEEM_BLOCK_CENTS = 1000; // $10 discount per block

/** Points earned for a paid order, from its subtotal in cents ($1 = 1 point). */
export function pointsEarned(subtotalCents: number): number {
  return Math.max(0, Math.floor(subtotalCents / 100));
}

/**
 * The largest discount (in cents) a balance can cover, in whole $10 blocks,
 * never exceeding `capCents` (e.g. the order subtotal).
 */
export function redeemableCents(points: number, capCents: number): number {
  const blocks = Math.floor(Math.max(0, points) / REDEEM_BLOCK_POINTS);
  const maxByBlocks = blocks * REDEEM_BLOCK_CENTS;
  const maxByBlocksCapped = Math.min(maxByBlocks, capCents);
  // Round the cap down to a whole block so points spent map cleanly.
  return Math.floor(maxByBlocksCapped / REDEEM_BLOCK_CENTS) * REDEEM_BLOCK_CENTS;
}

/** Points consumed for a given discount amount in cents. */
export function pointsForCents(discountCents: number): number {
  return Math.round((discountCents / REDEEM_BLOCK_CENTS) * REDEEM_BLOCK_POINTS);
}
