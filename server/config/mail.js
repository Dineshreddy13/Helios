import { BrevoClient } from "@getbrevo/brevo";
import { BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME } from "./env.js";

const brevo = new BrevoClient({
  apiKey: BREVO_API_KEY,
});

export const sendEmail = async ({ to, subject, html }) => {
  return await brevo.transactionalEmails.sendTransacEmail({
    subject: subject,
    htmlContent: html,
    sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
    to: [{ email: to }],
  });
};