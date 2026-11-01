import { createFormToken, sendStatus } from "../lib/newsletter.js";
import { messages, requestLang } from "../lib/i18n.js";

// Hands the signup and contact forms a short-lived token (`?purpose=contact` for the latter). Subscribing without one is refused,
// so scripts that post straight to /api/newsletter-subscribe never trigger a mail.
export default function handler(req, res) {
  const lang = requestLang(req);
  const t = messages[lang].token;
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    sendStatus(res, 405, { message: t.methodNotAllowed }, req, { lang });
    return;
  }

  const secret = process.env.NEWSLETTER_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    console.error("Newsletter form token is missing NEWSLETTER_TOKEN_SECRET");
    sendStatus(res, 503, { message: t.unavailable }, req, { lang });
    return;
  }

  res.statusCode = 200;
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  const purpose = new URL(req.url, "http://localhost").searchParams.get("purpose") === "contact" ? "contact" : "subscribe";
  res.end(JSON.stringify({ token: createFormToken(secret, Date.now(), purpose) }));
}
