// Shared domain types for Améthyste.
// Prices are always stored as integer cents in CAD to feed Stripe `unit_amount` directly.

export type Locale = "fr" | "en";

export type Localized = { fr: string; en: string };

export type UserRole = "customer" | "pro" | "admin";

export type ProStatus = "none" | "pending" | "approved" | "rejected";

export type PricingContext = "market" | "reseller";

export interface ProProfile {
  businessName: string;
  businessNumber?: string;
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
  currency: "cad";
  images: string[];
  sizes: ProductSize[];
  category: ProductCategory;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
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
  total: number;
  currency: "cad";
  shippingAddress: Address;
  stripe: { checkoutSessionId: string; paymentIntentId?: string };
  createdAt: number;
  paidAt?: number;
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
