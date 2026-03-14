import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => typeof value !== "string" || value.trim() === "")
  .map(([key]) => key);

export const firebaseConfigError = missingKeys.length > 0
  ? `Firebase auth is not configured yet. Missing: ${missingKeys.join(", ")}`
  : null;

const app = firebaseConfigError ? null : initializeApp(firebaseConfig);

export const auth = app ? getAuth(app) : null;
export const googleProvider = app ? new GoogleAuthProvider() : null;

if (googleProvider) {
  googleProvider.setCustomParameters({ prompt: "select_account" });
}

export const prefersRedirectAuth = () =>
  /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);
