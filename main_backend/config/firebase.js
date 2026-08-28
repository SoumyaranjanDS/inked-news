const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

try {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require('./firebase-service-account.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  } else {
    console.warn('⚠️  firebase-service-account.json not found — FCM push disabled');
  }
} catch (error) {
  console.error('❌ Firebase Admin SDK initialization error:', error.message);
}

module.exports = admin;
