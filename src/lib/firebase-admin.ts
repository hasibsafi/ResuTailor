import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
};

// Initialize Firebase Admin
const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];
const adminAuth = getAuth(app);

// Verify ID token from client
export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return null;
  }
}

// Get Firebase UID from authorization header
export async function getFirebaseUidFromHeader(authHeader: string | null): Promise<string | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  
  const idToken = authHeader.split("Bearer ")[1];
  const decodedToken = await verifyIdToken(idToken);
  
  return decodedToken?.uid ?? null;
}

export { adminAuth };
