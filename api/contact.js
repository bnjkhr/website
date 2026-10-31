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
import { messages, requestLang } from "../lib/i18n.js";

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
  const body = parseBody(req.body);
  const lang = requestLang(req, body);
  const t = messages[lang];
  const reply = (status, payload, page) => sendStatus(res, status, payload, req, { lang, ...page });

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    reply(405, { message: t.contact.methodNotAllowed });
    return;
  }

  const email = normalizeEmail(body.email);
  if (body.website) {
    logContact("warn", "honeypot", req, email);
    reply(200, { message: t.contact.thanks });
    return;
  }

  const secFetchSite = req.headers["sec-fetch-site"];
  if (secFetchSite && secFetchSite !== "same-origin" && secFetchSite !== "same-site") {
    logContact("warn", "cross-site-request", req, email);
    reply(400, { message: t.refresh });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const tokenSecret = process.env.NEWSLETTER_TOKEN_SECRET;
  if (!apiKey || !tokenSecret || tokenSecret.length < 32) {
    console.error("Contact form is missing RESEND_API_KEY or NEWSLETTER_TOKEN_SECRET");
    reply(503, { message: t.contact.unavailable });
    return;
  }

  if (!verifyFormToken(body.formToken, tokenSecret, Date.now(), "contact")) {
    logContact("warn", "invalid-form-token", req, email);
    reply(400, { message: t.refresh });
    return;
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret && !await passesTurnstile(turnstileSecret, body["cf-turnstile-response"], req)) {
    logContact("warn", "turnstile-failed", req, email);
    reply(400, { message: t.turnstile });
    return;
  }

  const name = singleLine(body.name);
  const message = String(body.message || "").trim();
  const topic = Object.hasOwn(TOPICS, body.topic) ? body.topic : "sonstiges";
  if (!name || !message) {
    reply(400, { message: t.contact.nameAndMessage });
    return;
  }
  if (name.length > MAX_NAME || message.length > MAX_MESSAGE) {
    reply(400, { message: t.contact.tooLong });
    return;
  }
  if (!isValidEmail(email)) {
    logContact("warn", "invalid-email", req, email);
    reply(400, { message: t.invalidEmail });
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
    reply(502, { message: t.contact.sendFailed });
    return;
  }

  logContact("log", "sent", req, email);
  reply(200, { title: t.contact.doneTitle, message: t.contact.doneMessage });
}
