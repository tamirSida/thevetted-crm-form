import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
};

const adminApp = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];
const adminAuth = getAuth(adminApp);

// Separate Firebase app for storage (vetted-application project)
let storageApp: App;
const existingStorageApp = getApps().find((app) => app.name === 'storage');
if (existingStorageApp) {
  storageApp = existingStorageApp;
} else {
  storageApp = initializeApp(
    {
      credential: cert({
        projectId: process.env.STORAGE_FIREBASE_PROJECT_ID,
        clientEmail: process.env.STORAGE_FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.STORAGE_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.STORAGE_FIREBASE_BUCKET,
    },
    'storage'
  );
}

const adminStorage = getStorage(storageApp);

export { adminApp, adminAuth, adminStorage };
