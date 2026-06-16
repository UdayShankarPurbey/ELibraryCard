import admin from "firebase-admin";
import fs from "fs";
import { env } from "./env.js";

let messaging = null;

export const initFirebase = () => {
  if (messaging || admin.apps.length) return messaging;
  const path = env.firebaseServiceAccountPath;
  if (!path || !fs.existsSync(path)) {
    return null;
  }
  const serviceAccount = JSON.parse(fs.readFileSync(path, "utf-8"));
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  messaging = admin.messaging();
  return messaging;
};

export const sendPushNotification = async (tokens, notification, data = {}) => {
  const client = initFirebase();
  const targets = Array.isArray(tokens) ? tokens : [tokens];
  if (!client || targets.length === 0) return null;
  return client.sendEachForMulticast({
    tokens: targets,
    notification,
    data,
  });
};
