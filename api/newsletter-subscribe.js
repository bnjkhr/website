import { Resend } from "resend";
import {
  createConfirmationToken,
  emailHash,
  escapeHtml,
  isValidEmail,
  normalizeEmail,
  sendStatus,
} from "../lib/newsletter.js";

function parseBody(body) {
  if (!body) return {};
  if (typeof body === "object") return body;
  try {
    return JSON.parse(body);
  } catch {
    return Object.fromEntries(new URLSearchParams(body));
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendStatus(res, 405, { message: "Diese Adresse akzeptiert nur Anmeldungen." }, req);
    return;
  }

  const body = parseBody(req.body);
  if (body.website) {
    sendStatus(res, 200, { message: "Bitte bestätige die Anmeldung über die E-Mail in deinem Postfach." }, req);
    return;
  }

  const email = normalizeEmail(body.email);
  if (!isValidEmail(email)) {
    sendStatus(res, 400, { message: "Bitte gib eine gültige E-Mail-Adresse ein." }, req);
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const tokenSecret = process.env.NEWSLETTER_TOKEN_SECRET;
  const vercelHost = process.env.VERCEL_TARGET_ENV === "preview"
    ? process.env.VERCEL_URL
    : process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  const siteUrl = process.env.SITE_URL
    || (vercelHost ? `https://${vercelHost}` : "https://benkohler.de");
  const from = process.env.NEWSLETTER_FROM || "Ben Kohler <newsletter@benkohler.de>";
  if (!apiKey || !tokenSecret || tokenSecret.length < 32) {
    console.error("Newsletter signup is missing RESEND_API_KEY or NEWSLETTER_TOKEN_SECRET");
    sendStatus(res, 503, { message: "Die Anmeldung ist gerade nicht verfügbar. Bitte versuche es später noch einmal." }, req);
    return;
  }

  const token = createConfirmationToken(email, tokenSecret);
  const confirmationUrl = new URL("/api/newsletter-confirm", siteUrl);
  confirmationUrl.searchParams.set("token", token);
  const safeUrl = escapeHtml(confirmationUrl.toString());
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: email,
    replyTo: "mail@benkohler.de",
    subject: "Bitte bestätige dein Blog-Abo",
    text: `Bestätige dein Abo für Updates von Ben Kohler:\n\n${confirmationUrl}\n\nDer Link ist 48 Stunden gültig. Wenn du dich nicht angemeldet hast, kannst du diese E-Mail ignorieren.`,
    html: `<div style="max-width:620px;margin:0 auto;padding:32px 20px;font-family:Arial,sans-serif;color:#162019;line-height:1.6">
      <h1 style="font-size:30px;line-height:1.15">Bitte bestätige dein Abo</h1>
      <p>Ein Klick fehlt noch. Danach erhältst du neue Beiträge zu meinen Produkten und ihrer Entwicklung per E-Mail.</p>
      <p style="margin:28px 0"><a href="${safeUrl}" style="display:inline-block;padding:13px 18px;border-radius:10px;background:#162019;color:#fff;text-decoration:none;font-weight:700">Abo bestätigen</a></p>
      <p style="font-size:13px;color:#5c685f">Der Link ist 48 Stunden gültig. Wenn du dich nicht angemeldet hast, kannst du diese E-Mail ignorieren.</p>
    </div>`,
  }, {
    idempotencyKey: `newsletter-confirm-${emailHash(email)}-${Math.floor(Date.now() / 3_600_000)}`,
  });

  if (error) {
    console.error("Newsletter confirmation email failed", { name: error.name, message: error.message });
    sendStatus(res, 502, { message: "Die Bestätigungsmail konnte nicht gesendet werden. Bitte versuche es später noch einmal." }, req);
    return;
  }

  sendStatus(res, 200, {
    title: "Fast geschafft.",
    message: "Bitte bestätige die Anmeldung über die E-Mail in deinem Postfach.",
  }, req);
}
