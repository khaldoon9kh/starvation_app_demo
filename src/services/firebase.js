import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Your Firebase configuration
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdH5lZicu0We3LBMi54aFISFL3LFfswxM",
  authDomain: "starvation-app.firebaseapp.com",
  projectId: "starvation-app",
  storageBucket: "starvation-app.firebasestorage.app",
  messagingSenderId: "804869298527",
  appId: "1:804869298527:web:ecb1b0e7808772f6b13eea"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // For React Native
});

// Initialize Storage
const storage = getStorage(app);

// For development - connect to emulators if running locally
// Uncomment these lines if you're using Firebase emulators
/*
if (__DEV__) {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
}
*/

export { db, storage };
export default app;