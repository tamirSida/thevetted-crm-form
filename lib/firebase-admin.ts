import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

// Firebase Admin SDK for storage (vetted-application project)
const storageApp =
  getApps().length === 0
    ? initializeApp({
        credential: cert({
          projectId: process.env.STORAGE_FIREBASE_PROJECT_ID,
          clientEmail: process.env.STORAGE_FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.STORAGE_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.STORAGE_FIREBASE_BUCKET,
      })
    : getApps()[0];

const adminStorage = getStorage(storageApp);

export { adminStorage };
