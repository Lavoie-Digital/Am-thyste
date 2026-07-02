"use server";

import { revalidatePath } from "next/cache";
import { getAdminDb } from "../firebase/admin";
import { ordersCol } from "../firebase/collections";
import { verifySession } from "../auth/dal";
import type { OrderStatus } from "../types";

const ALLOWED: OrderStatus[] = ["pending", "paid", "fulfilled", "cancelled", "refunded"];

async function requireAdmin() {
  const viewer = await verifySession();
  if (!viewer || viewer.role !== "admin") throw new Error("forbidden");
  return viewer;
}

/** Admin-only: update an order's fulfillment status (order tracker). */
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await requireAdmin();
  if (!ALLOWED.includes(status)) return { ok: false, error: "bad-status" };

  const db = getAdminDb();
  if (!db) return { ok: false, error: "not-configured" };

  const ref = ordersCol(db).doc(orderId);
  const snap = await ref.get();
  if (!snap.exists) return { ok: false, error: "not-found" };

  await ref.update({ status });
  revalidatePath("/tableau-de-bord/commandes");
  return { ok: true };
}
