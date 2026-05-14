import nodemailer from "nodemailer";
import { env } from "@/env";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: env.EMAIL_SERVER_HOST,
    port: Number(env.EMAIL_SERVER_PORT ?? 587),
    auth: {
      user: env.EMAIL_SERVER_USER,
      pass: env.EMAIL_SERVER_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: env.EMAIL_FROM ?? "dronelingo <noreply@dronelingo.eu>",
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
}
