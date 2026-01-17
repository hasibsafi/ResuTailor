import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInAnonymously, GoogleAuthProvider, signInWithPopup, linkWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// Sign in anonymously (default behavior)
export async function signInAnonymouslyIfNeeded() {
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
  return auth.currentUser;
}

// Get current user's ID token for API calls
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

// Upgrade anonymous account to Google
export async function linkWithGoogle() {
  const user = auth.currentUser;
  if (!user) throw new Error("No user signed in");
  
  const provider = new GoogleAuthProvider();
  
  if (user.isAnonymous) {
    // Link anonymous account to Google
    return linkWithPopup(user, provider);
  } else {
    // Already signed in with a provider
    return signInWithPopup(auth, provider);
  }
}

// Sign out
export async function signOut() {
  await auth.signOut();
}

export { app, auth, db };
