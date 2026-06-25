import "server-only";
import type { Timestamp } from "firebase-admin/firestore";
import { getAdminDb, adminConfigured } from "../firebase/admin";
import { usersCol, ordersCol } from "../firebase/collections";
import type { AppUser, Order } from "../types";

function toMs(v: unknown): number {
  if (!v) return 0;
  if (typeof v === "number") return v;
  const ts = v as Timestamp;
  return typeof ts.toMillis === "function" ? ts.toMillis() : 0;
}

/** All professional applicants (pending/approved/rejected). Admin-only — gate the caller. */
export async function listProUsers(): Promise<AppUser[]> {
  const db = getAdminDb();
  if (!adminConfigured || !db) return [];
  try {
    const snap = await usersCol(db).where("role", "in", ["pro"]).get();
    const rows = snap.docs.map((d) => {
      const data = d.data() as AppUser;
      return { ...data, uid: d.id, createdAt: toMs(data.createdAt), approvedAt: data.approvedAt ? toMs(data.approvedAt) : undefined };
    });
    return rows.sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.error("[admin] listProUsers failed:", err);
    return [];
  }
}

/** All orders, most recent first. Admin-only — gate the caller. */
export async function listOrders(): Promise<Order[]> {
  const db = getAdminDb();
  if (!adminConfigured || !db) return [];
  try {
    const snap = await ordersCol(db).orderBy("createdAt", "desc").limit(200).get();
    return snap.docs.map((d) => {
      const data = d.data() as Order;
      return { ...data, id: d.id, createdAt: toMs(data.createdAt), paidAt: data.paidAt ? toMs(data.paidAt) : undefined };
    });
  } catch (err) {
    console.error("[admin] listOrders failed:", err);
    return [];
  }
}
