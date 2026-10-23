import { Resend } from "resend";
import {
  emailHash,
  escapeHtml,
  isValidEmail,
  normalizeEmail,
  parseBody,
  sendStatus,
  verifyFormToken,
} from "../lib/newsletter.js";

const REFRESH_MESSAGE = "Bitte lade die Seite neu und versuche es noch einmal.";
const TURNSTILE_MESSAGE = "Die Sicherheitsprüfung ist fehlgeschlagen. Bitte versuche es noch einmal.";
const TOPICS = {
  projekt: "App-Projekt anfragen",
  feedback: "Frage oder Feedback zu einer App",
  sonstiges: "Sonstiges",
};
const MAX_NAME = 100;
const MAX_MESSAGE = 5000;

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
function logContact(level, reason, req, email) {
  console[level]([
    "contact",
    `reason=${reason}`,
    `emailHash=${email ? emailHash(email) : "-"}`,
    `userAgent=${JSON.stringify(String(req.headers["user-agent"] || "-").slice(0, 80))}`,
    `secFetchSite=${req.headers["sec-fetch-site"] || "-"}`,
  ].join(" "));
}

// A header value must stay on one line.
const singleLine = (value) => String(value || "").replace(/\s+/g, " ").trim();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendStatus(res, 405, { message: "Diese Adresse akzeptiert nur Nachrichten per Formular." }, req);
    return;
  }

  const body = parseBody(req.body);
  const email = normalizeEmail(body.email);
  if (body.website) {
    logContact("warn", "honeypot", req, email);
    sendStatus(res, 200, { message: "Danke, deine Nachricht ist angekommen." }, req);
    return;
  }

  const secFetchSite = req.headers["sec-fetch-site"];
  if (secFetchSite && secFetchSite !== "same-origin" && secFetchSite !== "same-site") {
    logContact("warn", "cross-site-request", req, email);
    sendStatus(res, 400, { message: REFRESH_MESSAGE }, req);
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const tokenSecret = process.env.NEWSLETTER_TOKEN_SECRET;
  if (!apiKey || !tokenSecret || tokenSecret.length < 32) {
    console.error("Contact form is missing RESEND_API_KEY or NEWSLETTER_TOKEN_SECRET");
    sendStatus(res, 503, { message: "Das Formular ist gerade nicht verfügbar. Bitte versuche es später noch einmal." }, req);
    return;
  }

  if (!verifyFormToken(body.formToken, tokenSecret, Date.now(), "contact")) {
    logContact("warn", "invalid-form-token", req, email);
    sendStatus(res, 400, { message: REFRESH_MESSAGE }, req);
    return;
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret && !await passesTurnstile(turnstileSecret, body["cf-turnstile-response"], req)) {
    logContact("warn", "turnstile-failed", req, email);
    sendStatus(res, 400, { message: TURNSTILE_MESSAGE }, req);
    return;
  }

  const name = singleLine(body.name);
  const message = String(body.message || "").trim();
  const topic = Object.hasOwn(TOPICS, body.topic) ? body.topic : "sonstiges";
  if (!name || !message) {
    sendStatus(res, 400, { message: "Bitte gib Name und Nachricht an." }, req);
    return;
  }
  if (name.length > MAX_NAME || message.length > MAX_MESSAGE) {
    sendStatus(res, 400, { message: "Name oder Nachricht sind zu lang." }, req);
    return;
  }
  if (!isValidEmail(email)) {
    logContact("warn", "invalid-email", req, email);
    sendStatus(res, 400, { message: "Bitte gib eine gültige E-Mail-Adresse ein." }, req);
    return;
  }

  const to = process.env.CONTACT_TO || "mail@benkohler.de";
  const from = process.env.CONTACT_FROM || "Ben Kohler Website <website@benkohler.de>";
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: email,
    subject: `${TOPICS[topic]}: ${name}`,
    text: `${name} <${email}>\nThema: ${TOPICS[topic]}\n\n${message}`,
    html: [
      "<h2>Neue Nachricht über das Kontaktformular</h2>",
      `<p><strong>Name:</strong> ${escapeHtml(name)}</p>`,
      `<p><strong>E-Mail:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>`,
      `<p><strong>Thema:</strong> ${escapeHtml(TOPICS[topic])}</p>`,
      `<pre style="white-space:pre-wrap;word-wrap:break-word;font-family:inherit">${escapeHtml(message)}</pre>`,
    ].join(""),
  });

  if (error) {
    logContact("error", "resend-failed", req, email);
    console.error("Contact email failed", { name: error.name, message: error.message });
    sendStatus(res, 502, { message: "Die Nachricht konnte nicht gesendet werden. Bitte versuche es später noch einmal." }, req);
    return;
  }

  logContact("log", "sent", req, email);
  sendStatus(res, 200, { title: "Danke!", message: "Deine Nachricht ist angekommen. Ich melde mich bei dir." }, req);
}
