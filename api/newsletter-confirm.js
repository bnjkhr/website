import { Resend } from "resend";
import {
  emailHash,
  parseBody,
  sendStatus,
  verifyConfirmationToken,
} from "../lib/newsletter.js";
import { messages, requestLang } from "../lib/i18n.js";

function isNotFound(error) {
  return error?.statusCode === 404 || error?.status === 404;
}

function isAlreadyAssigned(error) {
  return !error || error.statusCode === 409 || error.status === 409;
}

export default async function handler(req, res) {
  // Die Sprache steckt im Link (GET: ?lang=) bzw. im Formular der Bestätigungsseite (POST: lang).
  const lang = requestLang(req, req.method === "POST" ? parseBody(req.body) : {});
  const t = messages[lang].confirm;
  const reply = (status, payload, page) => sendStatus(res, status, payload, req, { lang, ...page });

  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    reply(405, { message: t.invalidLink });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const tokenSecret = process.env.NEWSLETTER_TOKEN_SECRET;
  const segmentId = process.env.RESEND_NEWSLETTER_SEGMENT_ID;
  const topicId = process.env.RESEND_NEWSLETTER_TOPIC_ID;
  if (!apiKey || !tokenSecret || tokenSecret.length < 32 || !segmentId) {
    console.error("Newsletter confirmation is missing required configuration");
    reply(503, { message: t.unavailable });
    return;
  }

  const token = req.method === "POST"
    ? parseBody(req.body).token
    : req.query?.token || new URL(req.url || "/api/newsletter-confirm", "http://localhost").searchParams.get("token");
  const confirmation = verifyConfirmationToken(token, tokenSecret);
  if (!confirmation) {
    reply(400, { title: t.expiredTitle, message: t.expiredMessage });
    return;
  }

  // Mail gateways and link scanners open links automatically. Opening the link
  // therefore only asks for confirmation; the subscription needs an explicit POST.
  if (req.method === "GET") {
    reply(200, { title: t.askTitle, message: t.ask(confirmation.email) }, { confirmToken: token });
    return;
  }

  const fail = (step, error) => {
    console.error(`Resend ${step} failed`, { name: error.name, message: error.message });
    reply(502, { message: t.failed });
  };

  const confirmedAt = Date.now();
  const contact = {
    email: confirmation.email,
    unsubscribed: false,
    // Proof of consent (Art. 7 Abs. 1 DSGVO).
    properties: {
      consent_requested_at: new Date(confirmation.issuedAt * 1000).toISOString(),
      consent_confirmed_at: new Date(confirmedAt).toISOString(),
      consent_version: confirmation.consentVersion,
    },
  };
  const topics = topicId ? [{ id: topicId, subscription: "opt_in" }] : undefined;

  const resend = new Resend(apiKey);
  const existing = await resend.contacts.get({ email: confirmation.email });
  if (existing.error && !isNotFound(existing.error)) return fail("contact lookup", existing.error);

  if (existing.data) {
    const updated = await resend.contacts.update(contact);
    if (updated.error) return fail("contact update", updated.error);

    const segment = await resend.contacts.segments.add({ email: confirmation.email, segmentId });
    if (segment.error && !isAlreadyAssigned(segment.error)) return fail("segment assignment", segment.error);

    if (topics) {
      const topic = await resend.contacts.topics.update({ email: confirmation.email, topics });
      if (topic.error) return fail("topic opt-in", topic.error);
    }
  } else {
    const created = await resend.contacts.create({ ...contact, segments: [{ id: segmentId }], topics });
    if (created.error) return fail("contact creation", created.error);
  }

  console.info("newsletter_consent_confirmed", {
    emailHash: emailHash(confirmation.email),
    issuedAt: confirmation.issuedAt,
    confirmedAt: Math.floor(confirmedAt / 1000),
    consentVersion: confirmation.consentVersion,
  });
  reply(200, { title: t.doneTitle, message: t.doneMessage });
}
