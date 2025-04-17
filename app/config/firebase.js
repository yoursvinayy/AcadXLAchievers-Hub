import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
};

// Validate required Firebase config
const requiredConfig = ['apiKey', 'authDomain', 'projectId'];
const missingConfig = requiredConfig.filter(key => !firebaseConfig[key]);

if (missingConfig.length > 0) {
  console.error('Missing required Firebase configuration:', missingConfig);
  throw new Error(`Missing required Firebase configuration: ${missingConfig.join(', ')}`);
}

// Debug logging
console.log('Initializing Firebase with config:', {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  // Log if environment variables are missing
  missingVars: Object.entries(firebaseConfig)
    .filter(([_, value]) => !value)
    .map(([key]) => key)
});

// Initialize Firebase
let app;
let db;
let auth;

try {
  // Check if Firebase is already initialized
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully');
  } else {
    app = getApps()[0];
    console.log('Using existing Firebase app');
  }

  // Initialize Firestore and Auth
  db = getFirestore(app);
  auth = getAuth(app);

  // Enable offline persistence only in browser environment
  if (typeof window !== 'undefined') {
    // Enable Firestore persistence
    enableIndexedDbPersistence(db, {
      synchronizeTabs: true
    }).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support persistence.');
      } else {
        console.error('Error enabling persistence:', err);
      }
    });

    // Set auth persistence
    setPersistence(auth, browserLocalPersistence).catch(error => {
      console.error('Error setting auth persistence:', error);
    });
  }

  // Verify Firebase initialization
  if (!app || !db || !auth) {
    throw new Error('Firebase services not properly initialized');
  }

  console.log('Firebase services initialized successfully:', {
    app: !!app,
    db: !!db,
    auth: !!auth,
    projectId: firebaseConfig.projectId
  });

} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw new Error(`Firebase initialization failed: ${error.message}`);
}

console.log('Firebase initialized with config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

export { app, db, auth };

export async function makeUserAdmin(userId) {
  try {
    await setDoc(doc(db, 'users', userId), {
      role: 'admin'
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error making user admin:', error);
    return false;
  }
}