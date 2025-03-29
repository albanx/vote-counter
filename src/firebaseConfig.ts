import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Initialize Firebase if it hasn't been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize auth
const auth = getAuth(app);

// Initialize Firestore with persistence settings
// Only enable persistence on client side
let db: Firestore;
if (typeof window !== 'undefined') {
  db = initializeFirestore(app, {
    // Remove the cacheSizeBytes property
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    })
  });
} else {
  // Server-side initialization without persistence
  db = getFirestore(app);
}

export { auth, db };