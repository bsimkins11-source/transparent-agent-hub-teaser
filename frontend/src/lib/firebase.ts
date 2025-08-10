// Centralized Firebase initialization and services
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getEnvironmentConfig } from '../config/environment';

// Singleton Firebase app instance
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

/**
 * Initialize Firebase services (singleton pattern)
 * Prevents duplicate initialization and provides consistent access
 */
export function initializeFirebase(): { app: FirebaseApp; auth: Auth; db: Firestore } {
  if (!app) {
    // Check if Firebase is already initialized
    const existingApps = getApps();
    
    if (existingApps.length > 0) {
      app = existingApps[0];
    } else {
      const config = getEnvironmentConfig();
      app = initializeApp(config.firebaseConfig);
    }
    
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Enable persistence for Firestore (offline support)
    // Note: This should be called before any other Firestore operations
    // enableNetwork(db).catch(console.error);
  }
  
  return { app, auth, db };
}

// Initialize and export services
const { app: firebaseApp, auth: firebaseAuth, db: firebaseDb } = initializeFirebase();

export { firebaseApp as app, firebaseAuth as auth, firebaseDb as db };
export default { app: firebaseApp, auth: firebaseAuth, db: firebaseDb };
