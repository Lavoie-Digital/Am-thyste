// Shared domain types for Améthyste.
// Prices are always stored as integer cents in CAD.

export type Locale = "fr" | "en";

export type Localized = { fr: string; en: string };

export type UserRole = "customer" | "pro" | "admin";

export type ProStatus = "none" | "pending" | "approved" | "rejected";

export type PricingContext = "market" | "reseller";

export interface ProProfile {
  businessName: string;
  /** URL to the uploaded hairdressing diploma proving professional status. */
  diplomaUrl: string;
  phone: string;
  address: Address;
}

export interface Address {
  name?: string;
  line1: string;
  line2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  proStatus: ProStatus;
  proProfile?: ProProfile;
  createdAt: number; // epoch ms
  approvedAt?: number;
  approvedBy?: string;
}

export type ProductCategory = "mask" | "serum" | "shampoo" | "conditioner" | "other";

export interface ProductSize {
  id: string;
  label: Localized;
  marketPrice?: number; // optional per-size override, cents
  resellerPrice?: number; // cents
  sku?: string;
}

export interface Product {
  id: string;
  slug: string;
  active: boolean;
  name: Localized;
  shortDesc: Localized;
  description: Localized;
  ritual?: Localized;
  ingredients?: Localized;
  marketPrice: number; // cents
  resellerPrice: number; // cents — NEVER serialized to unauthorized viewers
  /** When true, the product is shown to everyone but only approved pros / admins can buy it. */
  proOnly?: boolean;
  currency: "cad";
  images: string[];
  sizes: ProductSize[];
  category: ProductCategory;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
  /** Optimistic-locking counter, incremented on every admin save. Missing == 0 (legacy/seed). */
  version?: number;
}

/**
 * Product shape safe to ship to the client. `resellerPrice` is omitted unless
 * the server-verified viewer is an approved pro (or admin). Sizes are also
 * stripped of reseller pricing for unauthorized viewers.
 */
export interface ProductDTO {
  id: string;
  slug: string;
  active: boolean;
  name: Localized;
  shortDesc: Localized;
  description: Localized;
  ritual?: Localized;
  ingredients?: Localized;
  marketPrice: number;
  resellerPrice?: number; // present only for approved pros / admin
  /** When true, everyone sees it but only approved pros / admins may purchase. */
  proOnly?: boolean;
  currency: "cad";
  images: string[];
  sizes: Array<{
    id: string;
    label: Localized;
    marketPrice?: number;
    resellerPrice?: number;
    sku?: string;
  }>;
  category: ProductCategory;
  sortOrder: number;
}

export type OrderStatus = "pending" | "paid" | "fulfilled" | "cancelled" | "refunded";

export interface OrderLineItem {
  productId: string;
  sizeId?: string;
  nameSnapshot: Localized;
  unitAmount: number; // cents, server-computed
  quantity: number;
}

export interface Order {
  id: string;
  userId: string | null;
  email: string;
  pricingContext: PricingContext;
  status: OrderStatus;
  lineItems: OrderLineItem[];
  subtotal: number;
  shipping: number;
  tax: number; // cents — GST/HST/PST/QST, see lib/tax/canada.ts
  discount?: number; // cents — order-level discount
  total: number;
  currency: "cad";
  shippingAddress: Address;
  square: {
    paymentId: string;
    /** True if this order was reconstructed from the webhook fallback path
     * (server crashed between Square confirming payment and our own write) —
     * itemization may be a best-effort placeholder; verify with the customer. */
    reconstructed?: boolean;
  };
  createdAt: number;
  paidAt?: number;
}

/**
 * A landing-page partner (authorized distributor, certified salon, …).
 * Rendered in the "Où retrouver Améthyste" section and managed from the admin.
 * No sensitive data, so this is shipped to the client as-is.
 */
export interface Partner {
  id: string;
  name: string;
  logo: string; // image URL (Firebase Storage or /public asset)
  href: string; // external destination
  role: Localized; // e.g. "Distributeur autorisé"
  desc: Localized;
  cta: Localized; // link label, e.g. "Trouver une succursale"
  active: boolean;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  freeShippingThreshold: number; // cents, e.g. 10000 = $100
  flatShippingRate: number; // cents
  contactEmail: string;
  social?: { instagram?: string; facebook?: string };
  banner?: Localized | null;
}

/** The server-verified viewer used for pricing & gating decisions. */
export interface Viewer {
  uid: string;
  email: string;
  role: UserRole;
  proStatus: ProStatus;
}

/** A client cart line — only IDs + quantity. Prices are NEVER trusted from the client. */
export interface CartItem {
  productId: string;
  slug: string;
  sizeId?: string;
  name: Localized;
  image?: string;
  quantity: number;
  /** Display-only unit price (market). Server recomputes the authoritative price at checkout. */
  displayUnitAmount: number;
}
