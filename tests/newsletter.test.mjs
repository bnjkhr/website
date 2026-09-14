import assert from "node:assert/strict";
import test from "node:test";
import {
  createConfirmationToken,
  isValidEmail,
  normalizeEmail,
  verifyConfirmationToken,
} from "../lib/newsletter.js";
import confirmHandler from "../api/newsletter-confirm.js";
import subscribeHandler from "../api/newsletter-subscribe.js";

const secret = "test-secret-with-at-least-thirty-two-characters";

function createResponse() {
  return {
    headers: {},
    statusCode: 200,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    end(body = "") {
      this.body = body;
    },
  };
}

test("normalizes and validates email addresses", () => {
  assert.equal(normalizeEmail("  Ben@Example.DE "), "ben@example.de");
  assert.equal(isValidEmail("ben@example.de"), true);
  assert.equal(isValidEmail("not-an-email"), false);
});

test("confirmation token round-trips and expires", () => {
  const now = Date.parse("2026-09-14T10:00:00Z");
  const token = createConfirmationToken("ben@example.de", secret, now);
  const confirmation = verifyConfirmationToken(token, secret, now + 1000);
  assert.equal(confirmation.email, "ben@example.de");
  assert.equal(confirmation.consentVersion, "2026-09-14");
  assert.equal(verifyConfirmationToken(token, secret, now + 49 * 60 * 60 * 1000), null);
});

test("confirmation token rejects tampering", () => {
  const token = createConfirmationToken("ben@example.de", secret);
  assert.equal(verifyConfirmationToken(`${token}x`, secret), null);
  assert.equal(verifyConfirmationToken(token, `${secret}-other`), null);
});

test("subscribe endpoint rejects invalid addresses before calling Resend", async () => {
  const response = createResponse();
  await subscribeHandler({
    method: "POST",
    headers: { accept: "application/json" },
    body: { email: "not-an-email" },
  }, response);

  assert.equal(response.statusCode, 400);
  assert.match(response.body, /gültige E-Mail-Adresse/);
});

test("subscribe endpoint accepts the honeypot without calling Resend", async () => {
  const response = createResponse();
  await subscribeHandler({
    method: "POST",
    headers: { accept: "application/json" },
    body: { email: "bot@example.de", website: "https://spam.example" },
  }, response);

  assert.equal(response.statusCode, 200);
  assert.match(response.body, /bestätige/i);
});

test("confirmation endpoint reads tokens from the request URL", async () => {
  const previousEnvironment = {
    apiKey: process.env.RESEND_API_KEY,
    secret: process.env.NEWSLETTER_TOKEN_SECRET,
    segmentId: process.env.RESEND_NEWSLETTER_SEGMENT_ID,
  };
  process.env.RESEND_API_KEY = "re_test";
  process.env.NEWSLETTER_TOKEN_SECRET = secret;
  process.env.RESEND_NEWSLETTER_SEGMENT_ID = "segment-test";

  try {
    const response = createResponse();
    await confirmHandler({
      method: "GET",
      headers: { accept: "application/json" },
      url: "/api/newsletter-confirm?token=invalid",
    }, response);

    assert.equal(response.statusCode, 400);
    assert.match(response.body, /Link/);
  } finally {
    if (previousEnvironment.apiKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previousEnvironment.apiKey;
    if (previousEnvironment.secret === undefined) delete process.env.NEWSLETTER_TOKEN_SECRET;
    else process.env.NEWSLETTER_TOKEN_SECRET = previousEnvironment.secret;
    if (previousEnvironment.segmentId === undefined) delete process.env.RESEND_NEWSLETTER_SEGMENT_ID;
    else process.env.RESEND_NEWSLETTER_SEGMENT_ID = previousEnvironment.segmentId;
  }
});
