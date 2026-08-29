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

/**
 * All professional applicants (pending/approved/rejected). Admin-only — gate the caller.
 *
 * This deliberately unions three queries instead of filtering on `role == "pro"`
 * alone. Anyone who ever submitted an application carries a `proProfile`, and if
 * their `role`/`proStatus` gets clobbered they would silently vanish from this
 * queue — leaving the owner with no way to see or re-approve them. Matching on
 * the application payload as well means an applicant can never disappear.
 */
export async function listProUsers(): Promise<AppUser[]> {
  const db = getAdminDb();
  if (!adminConfigured || !db) return [];
  try {
    const col = usersCol(db);
    const snaps = await Promise.all([
      col.where("role", "==", "pro").get(),
      col.where("proStatus", "in", ["pending", "approved", "rejected"]).get(),
      // `orderBy` on a field only returns documents that actually have it, so
      // this picks up applicants whose role/status was reset to customer/none.
      col.orderBy("proProfile").get(),
    ]);

    const byUid = new Map<string, AppUser>();
    for (const snap of snaps) {
      for (const d of snap.docs) {
        if (byUid.has(d.id)) continue;
        const data = d.data() as AppUser;
        if (data.role === "admin") continue; // staff are not applicants
        byUid.set(d.id, {
          ...data,
          uid: d.id,
          createdAt: toMs(data.createdAt),
          approvedAt: data.approvedAt ? toMs(data.approvedAt) : undefined,
        });
      }
    }
    return [...byUid.values()].sort((a, b) => b.createdAt - a.createdAt);
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
