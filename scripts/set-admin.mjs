// Promote a user to the `admin` role (owner). Run after the person has signed up.
//
//   node --env-file=.env.local scripts/set-admin.mjs owner@email.com
//
// Sets the Firestore users/{uid} role to "admin" AND the matching custom claim.
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node --env-file=.env.local scripts/set-admin.mjs <email>");
  process.exit(1);
}

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

const user = await auth.getUserByEmail(email);
await auth.setCustomUserClaims(user.uid, { role: "admin", proStatus: "none" });
await db.collection("users").doc(user.uid).set(
  { uid: user.uid, email, role: "admin", proStatus: "none" },
  { merge: true },
);

console.log(`✓ ${email} is now an admin (uid: ${user.uid}). Sign out/in to refresh the token.`);
process.exit(0);
