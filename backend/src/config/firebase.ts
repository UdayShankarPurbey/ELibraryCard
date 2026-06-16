import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getMessaging, type Messaging, type Notification } from "firebase-admin/messaging";
import fs from "fs";
import { env } from "./env.js";

let messaging: Messaging | null = null;

export const initFirebase = (): Messaging | null => {
  if (messaging || getApps().length) return messaging;
  const path = env.firebaseServiceAccountPath;
  if (!path || !fs.existsSync(path)) return null;
  const serviceAccount = JSON.parse(fs.readFileSync(path, "utf-8"));
  initializeApp({ credential: cert(serviceAccount) });
  messaging = getMessaging();
  return messaging;
};

export const sendPushNotification = async (
  tokens: string | string[],
  notification: Notification,
  data: Record<string, string> = {},
) => {
  const client = initFirebase();
  const targets = Array.isArray(tokens) ? tokens : [tokens];
  if (!client || targets.length === 0) return null;
  return client.sendEachForMulticast({ tokens: targets, notification, data });
};
