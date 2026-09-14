import { Resend } from "resend";
import {
  emailHash,
  parseBody,
  sendStatus,
  verifyConfirmationToken,
} from "../lib/newsletter.js";

function isNotFound(error) {
  return error?.statusCode === 404 || error?.status === 404;
}

function isAlreadyAssigned(error) {
  return !error || error.statusCode === 409 || error.status === 409;
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    sendStatus(res, 405, { message: "Dieser Bestätigungslink ist ungültig." }, req);
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const tokenSecret = process.env.NEWSLETTER_TOKEN_SECRET;
  const segmentId = process.env.RESEND_NEWSLETTER_SEGMENT_ID;
  const topicId = process.env.RESEND_NEWSLETTER_TOPIC_ID;
  if (!apiKey || !tokenSecret || tokenSecret.length < 32 || !segmentId) {
    console.error("Newsletter confirmation is missing required configuration");
    sendStatus(res, 503, { message: "Die Bestätigung ist gerade nicht verfügbar. Bitte versuche es später noch einmal." }, req);
    return;
  }

  const token = req.method === "POST"
    ? parseBody(req.body).token
    : req.query?.token || new URL(req.url || "/api/newsletter-confirm", "http://localhost").searchParams.get("token");
  const confirmation = verifyConfirmationToken(token, tokenSecret);
  if (!confirmation) {
    sendStatus(res, 400, {
      title: "Link nicht mehr gültig.",
      message: "Der Bestätigungslink ist ungültig oder älter als 48 Stunden. Bitte melde dich erneut an.",
    }, req);
    return;
  }

  // Mail gateways and link scanners open links automatically. Opening the link
  // therefore only asks for confirmation; the subscription needs an explicit POST.
  if (req.method === "GET") {
    sendStatus(res, 200, {
      title: "Abo bestätigen?",
      message: `Ein Klick noch: Bestätige, dass ${confirmation.email} neue Beiträge per E-Mail erhalten soll.`,
    }, req, { confirmToken: token });
    return;
  }

  const fail = (step, error) => {
    console.error(`Resend ${step} failed`, { name: error.name, message: error.message });
    sendStatus(res, 502, { message: "Die Anmeldung konnte nicht bestätigt werden. Bitte versuche es später noch einmal." }, req);
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
  sendStatus(res, 200, {
    title: "Abo bestätigt.",
    message: "Du erhältst künftig neue Beiträge per E-Mail. Abmelden kannst du dich mit einem Klick in jeder Nachricht.",
  }, req);
}
