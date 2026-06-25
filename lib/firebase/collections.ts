import "server-only";
import type { Firestore } from "firebase-admin/firestore";

/** Centralized Firestore collection/document paths. */
export const COLLECTIONS = {
  users: "users",
  products: "products",
  orders: "orders",
  settings: "settings",
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
export function settingsDoc(db: Firestore) {
  return db.collection(COLLECTIONS.settings).doc(SETTINGS_DOC);
}
