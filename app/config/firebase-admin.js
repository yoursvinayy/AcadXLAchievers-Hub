import admin from 'firebase-admin';

const serviceAccount = {
  "type": "service_account",
  "project_id": "quiz-battle-app",
  "private_key_id": "38d2ad75cbec61ee4116c5936a1ec5339d40f327",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC5NZqtKKJ+ttDu\noMEj9JEzh3TpJBeQtxR7CpjAivzoXVjHaRrSc1v7EfoQi8zisTs33UrL9ca/r35k\nsyeNP3E07IwL3zc2ZL916jNMfZ+MeUkBLLExLVC2Q+Jfo98NqRnQJKjlrB6VCtZw\nJCOgoHqAanAB83/zCnp8fWY5Hhk8NmKA1YmBgIhAIzvWccYebm9O4113sVlXkNlU\nLxqAQXCicMFTdvZKmxcGiURlKQDDRfw0SkIBnNHwZpmQJYnwiZK7rcjgs0dy7LQD\nceF8ggBUftEoCGG3I5t8ye+DP7xiyzJVqrZnD7CADuOK+GIU/6rHa9w7aaQNvSTR\nU5tnbQb1AgMBAAECggEAA/zd5cy6Q55bPR7Bdy0jeOJPAlu9qnxCqOE3ckKGg630\n2iWkHJ68FC8U0l6MN1+nsyzPg445F19SNPKwOefr36mYh1iTnKx1JzcMdTZpj8b8\naysjl+KOT7+s7rBoKP1jL0/cF3E0tF1SyisrsuBEWvelDemzWiU3h27Uxgs6RwlU\nWbBLm+kF85smt6O6ERLCK0CBbC5/eY0LYLL18Uy4TkhYTkEYNGm2AV+7QWiQ5+u3\nQTBiBKpjG8Ods6nBbNcjmMqXhMeVbuNXy9zckO1Fx9giLmgVctY7Tg1w+yYuMobS\nWlRf23jMamCXKwUn4cdSrQdkI449FaHl5IMIcQQuGQKBgQDixF1q16i899bK3pjG\ntST9aywhQ6LhCLVkqnI/Y8dz1i9et4TNmIRf1fJRvHKlKbQEb9S33L7n2nHaXpAs\nBrilQzz2RbytigrxO24rO/oaaD5MJciHR6Bz5iHGOmTO2idAaZo3yjXGoVz8NChH\n6FDuHwna9mUv8ZxWskTUL45bWQKBgQDRFccHetiXFdhNsIOWLZX15sxqJPuWw0P3\nkxMFLxKqDerkUn0TB5Vgl13xcHV5GSmedxLDgnOsSNWIlKmA8L5rQM0Ml7WZS4J3\nYPQyvsTB55xzMSi7ttqHSCXN5HwpzbKll5JfhuLalWJ6e0ubbwfDK6DxVE8ojm0t\nxtcXJ8rA/QKBgQC22BRm8Mr6y2+ilkdjeW4A9ChaDfpILshsCc8i86Y/7YS2f40S\nZZbe21iOtT9Pk0e2iCFhuxknQ4inxbXD+gtqHcQK4wIWf4cBKaVUMQEhx8nrhk+h\nXIywxu+WsUDVVStvEXcq4t3ncfbS2I9eI6EVz2sX5bKDLPKdKRK8cDf9yQKBgQDF\ncy1rsOVNeMG2TFVXw2D0waqVKqu06l4LNQcnRBb6JP6H9CZNjEHS399FnJAzdkHJ\ndmVv4IfgUT/mJY4VSERrAN0jYTmLtLVWi2bRbTpea51hYzE2ZC3mx4l78KQYzjpB\nCuyd7cHZ7mz7gegatzW7aD4q6RWAFVChhD+njFp6+QKBgGiMKevKOpVGN9lj4e44\nABYcqGFZs2jqNJ+JKKrQ5pMXh0bLo4Qec9JTUOZtzd8Y+SrnXok+M0/ocKr1fmYd\nKO//MCAp9YDZwf2KjAaDHvOdkLXlQvIqQ2x9nnjmvFAqOsi9I5/H/fnYedOBgEBp\nZCgWZsGu7/h81CYQ3uJMRtYd\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@quiz-battle-app.iam.gserviceaccount.com",
  "client_id": "115824999657203337508",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40quiz-battle-app.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

// Initialize Firebase Admin only if it hasn't been initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    throw error; // This will help us see the error in development
  }
}

// Export the admin database instance
const db = admin.apps.length ? admin.firestore() : null;
if (!db) {
  throw new Error('Failed to initialize Firestore');
}

export { db as adminDb }; 