import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();


let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT.trim().startsWith("{")) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
      console.warn(
        "FIREBASE_SERVICE_ACCOUNT seems to be a path. Please provide the JSON content as a string.",
      );
    }
  } catch (e) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT", e);
  }
} else if (
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.FIREBASE_CLIENT_EMAIL
) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");

  serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: privateKey,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url:
      process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
  };
}


if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    console.warn("No Firebase credentials found. Admin SDK might fail.");
    admin.initializeApp();
  }
}

export default admin;
