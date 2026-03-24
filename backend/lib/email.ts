import { Resend } from "resend";

const resendKey = process.env.RESEND_API_KEY;
export const emailClient = resendKey ? new Resend(resendKey) : null;

export async function sendTransactionalEmail(to: string, subject: string, html: string) {
  if (!emailClient) return;
  await emailClient.emails.send({
    from: process.env.FROM_EMAIL ?? "noreply@example.com",
    to,
    subject,
    html
  });
}