import { Resend } from "resend";
import {
  createConfirmationToken,
  emailHash,
  escapeHtml,
  isValidEmail,
  normalizeEmail,
  parseBody,
  sendStatus,
  verifyFormToken,
} from "../lib/newsletter.js";
import { messages, requestLang } from "../lib/i18n.js";

// The idempotency key allows one confirmation mail per address per day. A repeated
// signup carries a fresh token, so Resend rejects the reused key – the earlier mail
// from this day is still valid, so the signup counts as sent.
const ALREADY_SENT_ERRORS = new Set(["invalid_idempotent_request", "concurrent_idempotent_requests"]);
const ONE_DAY_MS = 86_400_000;

async function passesTurnstile(secret, response, req) {
  if (typeof response !== "string" || !response) return false;
  try {
    const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret,
        response,
        remoteip: String(req.headers["x-forwarded-for"] || "").split(",")[0].trim(),
      }),
      signal: AbortSignal.timeout(5000),
    });
    return (await result.json()).success === true;
  } catch (error) {
    console.error("Turnstile verification failed", { message: error.message });
    return false;
  }
}

// One line per decision, so the Vercel logs show which route the bots take.
// The address only appears as a hash.
function logSignup(level, reason, req, email) {
  console[level]([
    "newsletter-subscribe",
    `reason=${reason}`,
    `emailHash=${email ? emailHash(email) : "-"}`,
    `contentType=${req.headers["content-type"] || "-"}`,
    `userAgent=${JSON.stringify(String(req.headers["user-agent"] || "-").slice(0, 80))}`,
    `secFetchSite=${req.headers["sec-fetch-site"] || "-"}`,
  ].join(" "));
}

export default async function handler(req, res) {
  const body = parseBody(req.body);
  const lang = requestLang(req, body);
  const t = messages[lang];
  const reply = (status, payload, page) => sendStatus(res, status, payload, req, { lang, ...page });

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    reply(405, { message: t.subscribe.methodNotAllowed });
    return;
  }

  if (body.website) {
    logSignup("warn", "honeypot", req, normalizeEmail(body.email));
    reply(200, { message: t.subscribe.checkInbox });
    return;
  }

  const email = normalizeEmail(body.email);
  const secFetchSite = req.headers["sec-fetch-site"];
  if (secFetchSite && secFetchSite !== "same-origin" && secFetchSite !== "same-site") {
    logSignup("warn", "cross-site-request", req, email);
    reply(400, { message: t.refresh });
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
    reply(503, { message: t.subscribe.unavailable });
    return;
  }

  if (!verifyFormToken(body.formToken, tokenSecret)) {
    logSignup("warn", "invalid-form-token", req, email);
    reply(400, { message: t.refresh });
    return;
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret && !await passesTurnstile(turnstileSecret, body["cf-turnstile-response"], req)) {
    logSignup("warn", "turnstile-failed", req, email);
    reply(400, { message: t.turnstile });
    return;
  }

  if (!isValidEmail(email)) {
    logSignup("warn", "invalid-email", req, email);
    reply(400, { message: t.invalidEmail });
    return;
  }

  const token = createConfirmationToken(email, tokenSecret);
  const confirmationUrl = new URL("/api/newsletter-confirm", siteUrl);
  confirmationUrl.searchParams.set("token", token);
  confirmationUrl.searchParams.set("lang", lang);
  const safeUrl = escapeHtml(confirmationUrl.toString());
  const mail = t.subscribe.mail;
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: email,
    replyTo: "mail@benkohler.de",
    subject: mail.subject,
    text: mail.text(confirmationUrl),
    html: `<div lang="${lang}" style="max-width:620px;margin:0 auto;padding:32px 20px;font-family:Arial,sans-serif;color:#162019;line-height:1.6">
      <h1 style="font-size:30px;line-height:1.15">${mail.heading}</h1>
      <p>${mail.intro}</p>
      <p style="margin:28px 0"><a href="${safeUrl}" style="display:inline-block;padding:13px 18px;border-radius:10px;background:#162019;color:#fff;text-decoration:none;font-weight:700">${mail.button}</a></p>
      <p style="font-size:13px;color:#5c685f">${mail.footnote}</p>
    </div>`,
  }, {
    idempotencyKey: `newsletter-confirm-${emailHash(email)}-${Math.floor(Date.now() / ONE_DAY_MS)}`,
  });

  if (error && !ALREADY_SENT_ERRORS.has(error.name)) {
    logSignup("error", "resend-failed", req, email);
    console.error("Newsletter confirmation email failed", { name: error.name, message: error.message });
    reply(502, { message: t.subscribe.sendFailed });
    return;
  }

  logSignup("log", error ? "already-sent" : "sent", req, email);
  reply(200, { title: t.status.okTitle, message: t.subscribe.checkInbox });
}
