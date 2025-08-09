// Firebase configuration - centralized and environment-based
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAf2KwetCFEARZiaBP_QW07JVT1_tfZ_IY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ai-agent-hub-web-portal-79fb0.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ai-agent-hub-web-portal-79fb0",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ai-agent-hub-web-portal-79fb0.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "72861076114",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:72861076114:web:1ea856ad05ef5f0eeef44b",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-JHLXTCXEDR"
} as const;

// Validate required config
const requiredFields = ['apiKey', 'authDomain', 'projectId'] as const;
const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

if (missingFields.length > 0) {
  throw new Error(`Missing required Firebase configuration: ${missingFields.join(', ')}`);
}
