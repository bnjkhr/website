import assert from "node:assert/strict";
import test from "node:test";
import {
  CONSENT_VERSION,
  createConfirmationToken,
  isValidEmail,
  normalizeEmail,
  verifyConfirmationToken,
} from "../lib/newsletter.js";
import confirmHandler from "../api/newsletter-confirm.js";
import subscribeHandler from "../api/newsletter-subscribe.js";

const secret = "test-secret-with-at-least-thirty-two-characters";
const email = "ben@example.de";
const configuredEnvironment = {
  RESEND_API_KEY: "re_test",
  NEWSLETTER_TOKEN_SECRET: secret,
  RESEND_NEWSLETTER_SEGMENT_ID: "segment-test",
  RESEND_NEWSLETTER_TOPIC_ID: "topic-test",
  SITE_URL: "https://benkohler.de",
};

async function callHandler(handler, request) {
  const response = {
    headers: {},
    statusCode: 200,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    end(body = "") {
      this.body = body;
    },
  };
  await handler({ headers: { accept: "application/json" }, ...request }, response);
  return response;
}

// Sets the newsletter environment and replaces fetch, which the Resend SDK uses
// for every API call. Routes are keyed by "METHOD /path"; unknown routes answer 200 {}.
async function withConfiguredApi(routes, run) {
  const previousEnvironment = Object.fromEntries(
    Object.keys(configuredEnvironment).map((key) => [key, process.env[key]]),
  );
  const originalFetch = globalThis.fetch;
  const calls = [];
  Object.assign(process.env, configuredEnvironment);
  globalThis.fetch = async (url, options = {}) => {
    const method = options.method || "GET";
    const path = decodeURIComponent(new URL(url).pathname);
    calls.push({ method, path, body: options.body ? JSON.parse(options.body) : undefined });
    const [status, payload] = routes[`${method} ${path}`] || [200, {}];
    return new Response(JSON.stringify(payload), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  };
  try {
    await run(calls);
  } finally {
    globalThis.fetch = originalFetch;
    for (const [key, value] of Object.entries(previousEnvironment)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("normalizes and validates email addresses", () => {
  assert.equal(normalizeEmail("  Ben@Example.DE "), "ben@example.de");
  assert.equal(isValidEmail("ben@example.de"), true);
  assert.equal(isValidEmail("not-an-email"), false);
});

test("confirmation token round-trips and expires", () => {
  const now = Date.parse("2026-09-14T10:00:00Z");
  const token = createConfirmationToken(email, secret, now);
  const confirmation = verifyConfirmationToken(token, secret, now + 1000);
  assert.equal(confirmation.email, email);
  assert.equal(confirmation.consentVersion, CONSENT_VERSION);
  assert.equal(verifyConfirmationToken(token, secret, now + 49 * 60 * 60 * 1000), null);
});

test("confirmation token rejects tampering", () => {
  const token = createConfirmationToken(email, secret);
  assert.equal(verifyConfirmationToken(`${token}x`, secret), null);
  assert.equal(verifyConfirmationToken(token, `${secret}-other`), null);
});

test("subscribe endpoint rejects invalid addresses before calling Resend", async () => {
  const response = await callHandler(subscribeHandler, { method: "POST", body: { email: "not-an-email" } });

  assert.equal(response.statusCode, 400);
  assert.match(response.body, /gültige E-Mail-Adresse/);
});

test("subscribe endpoint accepts the honeypot without calling Resend", async () => {
  const response = await callHandler(subscribeHandler, {
    method: "POST",
    body: { email: "bot@example.de", website: "https://spam.example" },
  });

  assert.equal(response.statusCode, 200);
  assert.match(response.body, /bestätige/i);
});

test("subscribe endpoint treats a repeated signup within the hour as already sent", async () => {
  await withConfiguredApi({
    "POST /emails": [409, {
      statusCode: 409,
      name: "invalid_idempotent_request",
      message: "Same idempotency key used with a different request payload.",
    }],
  }, async () => {
    const response = await callHandler(subscribeHandler, { method: "POST", body: { email } });

    assert.equal(response.statusCode, 200);
    assert.match(response.body, /bestätige/i);
  });
});

test("subscribe endpoint still reports real delivery failures", async () => {
  await withConfiguredApi({
    "POST /emails": [422, { statusCode: 422, name: "validation_error", message: "Invalid from address." }],
  }, async () => {
    const response = await callHandler(subscribeHandler, { method: "POST", body: { email } });

    assert.equal(response.statusCode, 502);
  });
});

test("confirmation endpoint rejects invalid tokens from the request URL", async () => {
  await withConfiguredApi({}, async () => {
    const response = await callHandler(confirmHandler, {
      method: "GET",
      url: "/api/newsletter-confirm?token=invalid",
    });

    assert.equal(response.statusCode, 400);
    assert.match(response.body, /Link/);
  });
});

test("opening the confirmation link only shows a button and changes nothing", async () => {
  await withConfiguredApi({}, async (calls) => {
    const token = createConfirmationToken(email, secret);
    const response = await callHandler(confirmHandler, {
      method: "GET",
      headers: { accept: "text/html" },
      url: `/api/newsletter-confirm?token=${token}`,
    });

    assert.equal(response.statusCode, 200);
    assert.match(response.body, /<form[^>]+method="post"/);
    assert.match(response.body, new RegExp(`name="token" value="${token}"`));
    assert.equal(calls.length, 0, "a link scanner must not be able to confirm the subscription");
  });
});

test("confirmation endpoint rejects invalid tokens on submit", async () => {
  await withConfiguredApi({}, async (calls) => {
    const response = await callHandler(confirmHandler, { method: "POST", body: "token=invalid" });

    assert.equal(response.statusCode, 400);
    assert.equal(calls.length, 0);
  });
});

test("confirming creates a new contact with consent evidence", async () => {
  await withConfiguredApi({
    [`GET /contacts/${email}`]: [404, { statusCode: 404, name: "not_found", message: "Contact not found" }],
    "POST /contacts": [201, { object: "contact", id: "contact-1" }],
  }, async (calls) => {
    const token = createConfirmationToken(email, secret, Date.now() - 60_000);
    const { issuedAt } = verifyConfirmationToken(token, secret);
    const response = await callHandler(confirmHandler, {
      method: "POST",
      body: new URLSearchParams({ token }).toString(),
    });

    assert.equal(response.statusCode, 200);
    const created = calls.find((call) => call.method === "POST" && call.path === "/contacts");
    assert.ok(created, "contact was not created");
    assert.deepEqual(created.body.segments, [{ id: "segment-test" }]);
    assert.deepEqual(created.body.topics, [{ id: "topic-test", subscription: "opt_in" }]);
    assert.equal(created.body.properties.consent_version, CONSENT_VERSION);
    assert.equal(created.body.properties.consent_requested_at, new Date(issuedAt * 1000).toISOString());
    assert.ok(Date.parse(created.body.properties.consent_confirmed_at) >= issuedAt * 1000);
  });
});

test("confirming an existing contact re-subscribes it with consent evidence", async () => {
  await withConfiguredApi({
    [`GET /contacts/${email}`]: [200, { object: "contact", id: "contact-1", email, unsubscribed: true }],
  }, async (calls) => {
    const token = createConfirmationToken(email, secret);
    const response = await callHandler(confirmHandler, { method: "POST", body: { token } });

    assert.equal(response.statusCode, 200);
    const updated = calls.find((call) => call.method === "PATCH" && call.path === `/contacts/${email}`);
    assert.ok(updated, "contact was not updated");
    assert.equal(updated.body.unsubscribed, false);
    assert.equal(updated.body.properties.consent_version, CONSENT_VERSION);
    assert.ok(calls.some((call) => call.method === "POST" && call.path === `/contacts/${email}/segments/segment-test`));
    assert.ok(calls.some((call) => call.method === "PATCH" && call.path === `/contacts/${email}/topics`));
  });
});

test("confirmation endpoint only allows GET and POST", async () => {
  const response = await callHandler(confirmHandler, { method: "PUT" });

  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, "GET, POST");
});
