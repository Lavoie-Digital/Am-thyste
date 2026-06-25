// Diagnostic: list every Auth user matching an email + their Firestore profile.
//   node --env-file=.env scripts/diagnose-user.mjs xavier@lavoiedigital.ca
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const email = (process.argv[2] || "").toLowerCase();

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

const { users } = await auth.listUsers(1000);
const matches = users.filter((u) => (u.email || "").toLowerCase() === email);

console.log(`Auth users with email ${email}: ${matches.length}`);
for (const u of matches) {
  console.log("──────────────────────────────");
  console.log("uid:", u.uid);
  console.log("providers:", u.providerData.map((p) => p.providerId).join(", ") || "(none)");
  console.log("emailVerified:", u.emailVerified);
  console.log("customClaims:", JSON.stringify(u.customClaims || {}));
  console.log("lastSignIn:", u.metadata.lastSignInTime || "(never)");
  const doc = await db.collection("users").doc(u.uid).get();
  console.log("firestore users/doc exists:", doc.exists, "→", doc.exists ? JSON.stringify({ role: doc.data().role, proStatus: doc.data().proStatus }) : "—");
}
process.exit(0);
