import { Resend } from "resend";
import {
  emailHash,
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
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
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

  const token = req.query?.token
    || new URL(req.url || "/api/newsletter-confirm", "http://localhost").searchParams.get("token");
  const confirmation = verifyConfirmationToken(token, tokenSecret);
  if (!confirmation) {
    sendStatus(res, 400, {
      title: "Link nicht mehr gültig.",
      message: "Der Bestätigungslink ist ungültig oder älter als 48 Stunden. Bitte melde dich erneut an.",
    }, req);
    return;
  }

  const resend = new Resend(apiKey);
  const existing = await resend.contacts.get({ email: confirmation.email });
  if (existing.error && !isNotFound(existing.error)) {
    console.error("Resend contact lookup failed", { name: existing.error.name, message: existing.error.message });
    sendStatus(res, 502, { message: "Die Anmeldung konnte nicht bestätigt werden. Bitte versuche es später noch einmal." }, req);
    return;
  }

  if (existing.data) {
    const updated = await resend.contacts.update({ email: confirmation.email, unsubscribed: false });
    if (updated.error) {
      console.error("Resend contact update failed", { name: updated.error.name, message: updated.error.message });
      sendStatus(res, 502, { message: "Die Anmeldung konnte nicht bestätigt werden. Bitte versuche es später noch einmal." }, req);
      return;
    }
  } else {
    const created = await resend.contacts.create({
      email: confirmation.email,
      unsubscribed: false,
      segments: [{ id: segmentId }],
      topics: topicId ? [{ id: topicId, subscription: "opt_in" }] : undefined,
    });
    if (created.error) {
      console.error("Resend contact creation failed", { name: created.error.name, message: created.error.message });
      sendStatus(res, 502, { message: "Die Anmeldung konnte nicht bestätigt werden. Bitte versuche es später noch einmal." }, req);
      return;
    }
  }

  if (existing.data) {
    const segment = await resend.contacts.segments.add({ email: confirmation.email, segmentId });
    if (segment.error && !isAlreadyAssigned(segment.error)) {
      console.error("Resend segment assignment failed", { name: segment.error.name, message: segment.error.message });
      sendStatus(res, 502, { message: "Die Anmeldung konnte nicht bestätigt werden. Bitte versuche es später noch einmal." }, req);
      return;
    }
    if (topicId) {
      const topic = await resend.contacts.topics.update({
        email: confirmation.email,
        topics: [{ id: topicId, subscription: "opt_in" }],
      });
      if (topic.error) {
        console.error("Resend topic opt-in failed", { name: topic.error.name, message: topic.error.message });
        sendStatus(res, 502, { message: "Die Anmeldung konnte nicht bestätigt werden. Bitte versuche es später noch einmal." }, req);
        return;
      }
    }
  }

  console.info("newsletter_consent_confirmed", {
    emailHash: emailHash(confirmation.email),
    issuedAt: confirmation.issuedAt,
    confirmedAt: Math.floor(Date.now() / 1000),
    consentVersion: confirmation.consentVersion,
  });
  sendStatus(res, 200, {
    title: "Abo bestätigt.",
    message: "Du erhältst künftig neue Beiträge per E-Mail. Abmelden kannst du dich mit einem Klick in jeder Nachricht.",
  }, req);
}
