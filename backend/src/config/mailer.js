import nodemailer from "nodemailer";
import { env } from "./env.js";

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!env.mail.user || !env.mail.pass) return null;
  transporter = nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.port === 465,
    auth: { user: env.mail.user, pass: env.mail.pass },
  });
  return transporter;
};

export const sendMail = async ({ to, subject, html, text }) => {
  const client = getTransporter();
  if (!client) return null;
  return client.sendMail({ from: env.mail.from, to, subject, html, text });
};
