import "server-only";
import type { Firestore } from "firebase-admin/firestore";

/** Centralized Firestore collection/document paths. */
export const COLLECTIONS = {
  users: "users",
  products: "products",
  orders: "orders",
  settings: "settings",
  partners: "partners",
} as const;

export const SETTINGS_DOC = "global";

export function usersCol(db: Firestore) {
  return db.collection(COLLECTIONS.users);
}
export function productsCol(db: Firestore) {
  return db.collection(COLLECTIONS.products);
}
export function ordersCol(db: Firestore) {
  return db.collection(COLLECTIONS.orders);
}
export function partnersCol(db: Firestore) {
  return db.collection(COLLECTIONS.partners);
}
/**
 * Marker written the first time the admin edits partners. Once it exists the
 * `partners` collection is the source of truth — an empty collection means
 * "no partners", not "fall back to the seed list".
 */
export function partnersMetaDoc(db: Firestore) {
  return db.collection(COLLECTIONS.settings).doc("partners-meta");
}
export function settingsDoc(db: Firestore) {
  return db.collection(COLLECTIONS.settings).doc(SETTINGS_DOC);
}
