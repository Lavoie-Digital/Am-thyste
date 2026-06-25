import "server-only";
import {
  initializeApp,
  getApps,
  getApp,
  cert,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

/**
 * Normalize a service-account private key coming from an env var. Hosts (Render,
 * Vercel, etc.) and copy/paste handle it inconsistently, so we defensively:
 *  - strip surrounding single/double quotes that got included in the value,
 *  - convert escaped "\n" sequences into real newlines,
 *  - leave already-real newlines untouched.
 */
function normalizePrivateKey(raw: string | undefined): string | undefined {
  if (!raw) return raw;
  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\n/g, "\n");
}

const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

/** True when real Firebase Admin service-account credentials are present. */
export const adminConfigured = Boolean(
  projectId &&
    clientEmail &&
    privateKey &&
    !clientEmail.includes("YOUR_") &&
    !privateKey.includes("PLACEHOLDER"),
);

let adminApp: App | null = null;

function getAdminApp(): App | null {
  if (!adminConfigured) return null;
  if (!adminApp) {
    adminApp = getApps().length
      ? getApp()
      : initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
  }
  return adminApp;
}

/** Firebase Admin Auth, or null if not configured. */
export function getAdminAuth(): Auth | null {
  const a = getAdminApp();
  return a ? getAuth(a) : null;
}

/** Firebase Admin Firestore, or null if not configured. */
export function getAdminDb(): Firestore | null {
  const a = getAdminApp();
  return a ? getFirestore(a) : null;
}
