import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getEnvironmentConfig } from './environment';

const config = getEnvironmentConfig();

// Initialize Firebase
const app = initializeApp(config.firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export the app instance
export default app;

// Export environment info for debugging
export const environment = config.environment;
export const projectId = config.projectId;
