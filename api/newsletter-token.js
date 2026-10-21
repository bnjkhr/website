import { createFormToken, sendStatus } from "../lib/newsletter.js";

// Hands the signup form a short-lived token. Subscribing without one is refused,
// so scripts that post straight to /api/newsletter-subscribe never trigger a mail.
export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    sendStatus(res, 405, { message: "Diese Adresse akzeptiert nur GET-Anfragen." }, req);
    return;
  }

  const secret = process.env.NEWSLETTER_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    console.error("Newsletter form token is missing NEWSLETTER_TOKEN_SECRET");
    sendStatus(res, 503, { message: "Die Anmeldung ist gerade nicht verfügbar. Bitte versuche es später noch einmal." }, req);
    return;
  }

  res.statusCode = 200;
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ token: createFormToken(secret) }));
}
