import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
if (!getApps().length) {
  initializeApp({ credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  })});
}
const auth = getAuth(); const db = getFirestore();
const EMAIL = "qa-mobile-delete-me@lavoiedigital.ca"; const PASS = "QaTest!2026x";
const mode = process.argv[2];
const find = async () => { try { return await auth.getUserByEmail(EMAIL); } catch { return null; } };
if (mode === "create") {
  let u = await find();
  if (!u) u = await auth.createUser({ email: EMAIL, password: PASS, displayName: "QA Mobile", emailVerified: true });
  await auth.setCustomUserClaims(u.uid, { role: "customer", proStatus: "none" });
  await db.collection("users").doc(u.uid).set({ uid: u.uid, email: EMAIL, displayName: "QA Mobile", role: "customer", proStatus: "none", createdAt: FieldValue.serverTimestamp() }, { merge: true });
  console.log("created", u.uid);
} else if (mode === "promote") {
  const u = await find();
  await auth.setCustomUserClaims(u.uid, { role: "pro", proStatus: "approved" });
  await db.collection("users").doc(u.uid).set({ role: "pro", proStatus: "approved" }, { merge: true });
  console.log("promoted");
} else if (mode === "pending") {
  const u = await find();
  await auth.setCustomUserClaims(u.uid, { role: "pro", proStatus: "pending" });
  await db.collection("users").doc(u.uid).set({ role: "pro", proStatus: "pending" }, { merge: true });
  console.log("pending");
} else if (mode === "delete") {
  const u = await find();
  if (u) { await db.collection("users").doc(u.uid).delete(); await auth.deleteUser(u.uid); console.log("deleted"); }
}
process.exit(0);
