import admin from 'firebase-admin';
import { config } from './env';

let firebaseApp: admin.app.App | null = null;

export function getFirebaseAdmin(): admin.app.App | null {
  if (!config.firebase.enabled) {
    return null;
  }
  if (firebaseApp) {
    return firebaseApp;
  }
  if (
    config.firebase.projectId &&
    config.firebase.clientEmail &&
    config.firebase.privateKey
  ) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey,
      }),
      ...(config.firebase.databaseUrl && { databaseURL: config.firebase.databaseUrl }),
    });
    return firebaseApp;
  }
  return null;
}

export function getMessaging(): admin.messaging.Messaging | null {
  const app = getFirebaseAdmin();
  return app ? app.messaging() : null;
}

export function isFirebaseEnabled(): boolean {
  return config.firebase.enabled;
}
