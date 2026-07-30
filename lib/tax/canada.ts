/**
 * Canadian sales tax (GST + provincial) by shipping province, applied to the
 * taxable amount (subtotal + shipping). Square has no per-address automatic
 * tax engine like Stripe Tax, so this replaces it.
 *
 * Best-effort table as of 2026 — rates change occasionally (e.g. Nova Scotia
 * cut its HST from 15% to 14% in April 2025). Verify with an accountant
 * before relying on this for tax remittance.
 */
const RATES: Record<string, number> = {
  AB: 0.05, // GST only
  BC: 0.12, // GST 5% + PST 7%
  MB: 0.12, // GST 5% + RST 7%
  NB: 0.15, // HST
  NL: 0.15, // HST
  NS: 0.14, // HST (reduced from 15% in April 2025)
  NT: 0.05, // GST only
  NU: 0.05, // GST only
  ON: 0.13, // HST
  PE: 0.15, // HST
  QC: 0.14975, // GST 5% + QST 9.975% (both on the pre-tax price, not compounded)
  SK: 0.11, // GST 5% + PST 6%
  YT: 0.05, // GST only
};

/** Sales tax in cents for a taxable amount (cents) and a Canadian province code. */
export function computeTax(taxableAmountCents: number, province: string): number {
  const rate = RATES[province.trim().toUpperCase()] ?? 0.05; // unknown province: federal GST only
  return Math.round(taxableAmountCents * rate);
}
