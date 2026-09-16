import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let authReady: Promise<void> = Promise.resolve();

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();

    // Clear old Better Auth data that may conflict with Firebase
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith("better-auth") || key.startsWith("ba:")) {
          localStorage.removeItem(key);
        }
      }
    } catch {}

    // Set persistence to localStorage — AWAIT it so onAuthStateChanged
    // doesn't fire before persistence is configured
    authReady = setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn("Firebase persistence setup failed:", err);
    });
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

export { app, auth, googleProvider, authReady };
export const isFirebaseConfigured = Boolean(auth);
