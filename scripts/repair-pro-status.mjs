/**
 * Repairs accounts whose pro status was wiped by the createProfile demotion bug
 * (a Google sign-in used to overwrite role/proStatus with customer/none, leaving
 * `proProfile` and `approvedAt` orphaned on the document).
 *
 *   node --env-file=.env scripts/repair-pro-status.mjs          # dry run
 *   node --env-file=.env scripts/repair-pro-status.mjs --apply  # write
 */
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const apply = process.argv.includes("--apply");

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}
const auth = getAuth();
const db = getFirestore();

// Every document carrying an application payload, whatever its current role.
const snap = await db.collection("users").orderBy("proProfile").get();
let n = 0;

for (const doc of snap.docs) {
  const d = doc.data();
  if (d.role === "admin") continue;
  if (d.role === "pro" && d.proStatus !== "none") continue; // healthy

  // An `approvedAt` stamp is proof the owner already approved this applicant;
  // otherwise the application is simply awaiting review again.
  const status = d.approvedAt ? "approved" : "pending";
  n++;
  console.log(
    `${apply ? "REPAIR" : "WOULD REPAIR"}  ${d.email}  ${d.role}/${d.proStatus} → pro/${status}` +
      (d.approvedAt ? "  (has approvedAt)" : ""),
  );

  if (apply) {
    await doc.ref.update({ role: "pro", proStatus: status });
    await auth.setCustomUserClaims(doc.id, { role: "pro", proStatus: status });
  }
}

console.log(n === 0 ? "Nothing to repair." : `${n} account(s) ${apply ? "repaired" : "affected"}.`);
if (n && !apply) console.log("Re-run with --apply to write the changes.");
process.exit(0);
