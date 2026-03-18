import nodemailer from 'nodemailer';

export function getBrevoTransport() {
  const user = process.env.BREVO_SMTP_USER;
  const pass = process.env.BREVO_SMTP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: { user, pass },
  });
}

export function isBrevoConfigured(): boolean {
  return Boolean(process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_PASSWORD);
}
