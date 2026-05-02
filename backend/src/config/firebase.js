const admin = require('firebase-admin');

let bucket = null;
let auth = null;
let messaging = null;

try {
  // Check if all required env vars exist
  if (!process.env.FIREBASE_PROJECT_ID || 
      !process.env.FIREBASE_PRIVATE_KEY || 
      !process.env.FIREBASE_CLIENT_EMAIL) {
    console.warn('⚠️  Firebase credentials missing. File upload will use fallback mode.');
  } else {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
    });

    bucket = admin.storage().bucket();
    auth = admin.auth();
    messaging = admin.messaging();

    console.log('✅ Firebase initialized successfully');
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
  console.log('⚠️  Running without Firebase storage. File uploads will use fallback.');
}

module.exports = { 
  admin, 
  auth, 
  messaging, 
  bucket,
  isFirebaseReady: () => bucket !== null
};
