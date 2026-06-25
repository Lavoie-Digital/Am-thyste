// Import the seed catalog + default settings into Firestore.
//
//   node --env-file=.env.local scripts/seed-firestore.mjs
//
// Idempotent: products are keyed by their seed id, settings by `global`.
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Re-read the seed data from the compiled TS source via a small inline copy is
// avoided — instead we import the JSON-equivalent by evaluating the TS module is
// not possible in plain node, so we duplicate the minimal shape here by reading
// the seed through a JSON export. For simplicity we require a generated seed.json.
const __dirname = dirname(fileURLToPath(import.meta.url));
const seed = JSON.parse(readFileSync(join(__dirname, "seed.json"), "utf8"));

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

for (const p of seed.products) {
  const { id, ...data } = p;
  await db.collection("products").doc(id).set(
    { ...data, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() },
    { merge: true },
  );
  console.log(`✓ product ${id}`);
}

await db.collection("settings").doc("global").set(seed.settings, { merge: true });
console.log("✓ settings/global");
console.log("Done.");
process.exit(0);
