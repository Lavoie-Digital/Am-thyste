import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
if (!getApps().length) initializeApp({credential:cert({projectId:process.env.FIREBASE_PROJECT_ID,clientEmail:process.env.FIREBASE_CLIENT_EMAIL,privateKey:process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g,"\n")})});
const d = await getFirestore().collection("settings").doc("general").get();
console.log("settings/general:", JSON.stringify(d.data()));
console.log("SENDGRID_OWNER_EMAIL env:", process.env.SENDGRID_OWNER_EMAIL);
console.log("SENDGRID_FROM_EMAIL env:", process.env.SENDGRID_FROM_EMAIL);
console.log("SENDGRID key set:", !!process.env.SENDGRID_API_KEY);
process.exit(0);
