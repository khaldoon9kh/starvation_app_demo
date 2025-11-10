import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, ref, getBytes } from 'firebase/storage';

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

// ==================== SECURE FILE URL GENERATION ====================

/**
 * Generate a temporary download URL for a diagram image
 * @param {string} imageFilePath - Path to image in storage (e.g., "diagrams/diagram_123_timestamp.jpg")
 * @returns {Promise<string>} Temporary download URL
 */
export const getDiagramImageUrl = async (imageFilePath) => {
  try {
    if (!imageFilePath) {
      console.warn('⚠️ No image file path provided for diagram');
      return null;
    }

    const fileRef = ref(storage, imageFilePath);
    
    // Import getDownloadURL dynamically to avoid circular imports
    const { getDownloadURL } = await import('firebase/storage');
    const url = await getDownloadURL(fileRef);
    
    console.log('✅ Generated diagram image URL:', imageFilePath);
    return url;
  } catch (error) {
    // Check for permission errors and provide helpful guidance
    if (error.code === 'storage/unauthorized') {
      console.error('❌ Permission Error: Firebase Storage rules do not allow read access');
      console.error('📋 Fix: Go to Firebase Console → Storage → Rules and allow public read access');
      console.error('🔗 See FIREBASE_STORAGE_RULES_FIX.md for step-by-step instructions');
    } else {
      console.error('❌ Error generating diagram image URL:', error);
    }
    return null;
  }
};

/**
 * Fallback URL generator for diagrams when new system not available
 * Use this temporarily while Firebase Storage rules are being fixed
 */
export const getDiagramImageUrlFallback = async (imageFilePath, fallbackUrl) => {
  try {
    // Try new system first
    const newUrl = await getDiagramImageUrl(imageFilePath);
    if (newUrl) {
      return newUrl;
    }
    
    // If new system fails (e.g., permission error), fall back to old URL
    if (fallbackUrl) {
      console.warn('⚠️ Using fallback URL due to Firebase Storage permission issue');
      return fallbackUrl;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error in fallback URL generator:', error);
    return fallbackUrl || null;
  }
};

/**
 * Generate a temporary download URL for a template PDF
 * @param {string} pdfFilePath - Path to PDF in storage (e.g., "templates/template_123_timestamp.pdf")
 * @returns {Promise<string>} Temporary download URL
 */
export const getTemplateDocumentUrl = async (pdfFilePath) => {
  try {
    if (!pdfFilePath) {
      console.warn('⚠️ No PDF file path provided for template');
      return null;
    }

    const fileRef = ref(storage, pdfFilePath);
    
    // Import getDownloadURL dynamically to avoid circular imports
    const { getDownloadURL } = await import('firebase/storage');
    const url = await getDownloadURL(fileRef);
    
    console.log('✅ Generated template PDF URL:', pdfFilePath);
    return url;
  } catch (error) {
    // Check for permission errors and provide helpful guidance
    if (error.code === 'storage/unauthorized') {
      console.error('❌ Permission Error: Firebase Storage rules do not allow read access');
      console.error('📋 Fix: Go to Firebase Console → Storage → Rules and allow public read access');
      console.error('🔗 See FIREBASE_STORAGE_RULES_FIX.md for step-by-step instructions');
    } else {
      console.error('❌ Error generating template PDF URL:', error);
    }
    return null;
  }
};

/**
 * Fallback URL generator for templates when new system not available
 * Use this temporarily while Firebase Storage rules are being fixed
 */
export const getTemplateDocumentUrlFallback = async (pdfFilePath, fallbackUrl) => {
  try {
    // Try new system first
    const newUrl = await getTemplateDocumentUrl(pdfFilePath);
    if (newUrl) {
      return newUrl;
    }
    
    // If new system fails (e.g., permission error), fall back to old URL
    if (fallbackUrl) {
      console.warn('⚠️ Using fallback URL due to Firebase Storage permission issue');
      return fallbackUrl;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error in fallback URL generator:', error);
    return fallbackUrl || null;
  }
};

export { db, storage };
export default app;