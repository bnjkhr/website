import assert from "node:assert/strict";
import test from "node:test";
import {
  CONSENT_VERSION,
  createConfirmationToken,
  createFormToken,
  isValidEmail,
  normalizeEmail,
  verifyConfirmationToken,
  verifyFormToken,
} from "../lib/newsletter.js";
import confirmHandler from "../api/newsletter-confirm.js";
import subscribeHandler from "../api/newsletter-subscribe.js";
import tokenHandler from "../api/newsletter-token.js";
import contactHandler from "../api/contact.js";

const secret = "test-secret-with-at-least-thirty-two-characters";
const email = "ben@example.de";
const configuredEnvironment = {
  RESEND_API_KEY: "re_test",
  NEWSLETTER_TOKEN_SECRET: secret,
  RESEND_NEWSLETTER_SEGMENT_ID: "segment-test",
  RESEND_NEWSLETTER_TOPIC_ID: "topic-test",
  SITE_URL: "https://benkohler.de",
};

// A form token as the browser would hold it: issued `ageSeconds` ago.
const formTokenAged = (ageSeconds) => createFormToken(secret, Date.now() - ageSeconds * 1000);
const emailsSent = (calls) => calls.filter((call) => call.method === "POST" && call.path === "/emails");

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
async function withConfiguredApi(routes, run, extraEnvironment = {}) {
  const environment = { ...configuredEnvironment, ...extraEnvironment };
  const previousEnvironment = Object.fromEntries(
    [...Object.keys(environment), "TURNSTILE_SECRET_KEY"].map((key) => [key, process.env[key]]),
  );
  const originalFetch = globalThis.fetch;
  const calls = [];
  delete process.env.TURNSTILE_SECRET_KEY;
  Object.assign(process.env, environment);
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

test("form token round-trips within its validity window", () => {
  const now = Date.parse("2026-10-20T10:00:00Z");
  const token = createFormToken(secret, now);
  assert.ok(verifyFormToken(token, secret, now + 10_000));
  assert.ok(verifyFormToken(token, secret, now + 3_000));
  assert.ok(verifyFormToken(token, secret, now + 2 * 60 * 60 * 1000));
});

test("form token is rejected when too young or expired", () => {
  const now = Date.parse("2026-10-20T10:00:00Z");
  const token = createFormToken(secret, now);
  assert.ok(!verifyFormToken(token, secret, now));
  assert.ok(!verifyFormToken(token, secret, now + 2_999));
  assert.ok(!verifyFormToken(token, secret, now + 2 * 60 * 60 * 1000 + 1_000));
});

test("form token rejects tampering, other secrets and confirmation tokens", () => {
  const now = Date.now();
  const token = createFormToken(secret, now - 10_000);
  assert.ok(!verifyFormToken(`${token}x`, secret, now));
  assert.ok(!verifyFormToken(token, `${secret}-other`, now));
  assert.ok(!verifyFormToken("", secret, now));
  assert.ok(!verifyFormToken(undefined, secret, now));
  assert.ok(!verifyFormToken(createConfirmationToken(email, secret, now - 10_000), secret, now));
});

test("subscribe endpoint rejects invalid addresses before calling Resend", async () => {
  await withConfiguredApi({}, async (calls) => {
    const response = await callHandler(subscribeHandler, {
      method: "POST",
      body: { email: "not-an-email", formToken: formTokenAged(10) },
    });

    assert.equal(response.statusCode, 400);
    assert.match(response.body, /gültige E-Mail-Adresse/);
    assert.equal(calls.length, 0);
  });
});

test("subscribe endpoint rejects a missing form token without calling Resend", async () => {
  await withConfiguredApi({}, async (calls) => {
    const response = await callHandler(subscribeHandler, { method: "POST", body: { email } });

    assert.equal(response.statusCode, 400);
    assert.match(response.body, /Seite neu/);
    assert.equal(calls.length, 0);
  });
});

test("subscribe endpoint rejects a form token that is too young or expired", async () => {
  await withConfiguredApi({}, async (calls) => {
    for (const age of [0, 2 * 60 * 60 + 60]) {
      const response = await callHandler(subscribeHandler, {
        method: "POST",
        body: { email, formToken: formTokenAged(age) },
      });
      assert.equal(response.statusCode, 400, `age ${age}s`);
      assert.match(response.body, /Seite neu/);
    }
    assert.equal(calls.length, 0);
  });
});

test("subscribe endpoint sends the confirmation mail for a valid form token", async () => {
  await withConfiguredApi({}, async (calls) => {
    const response = await callHandler(subscribeHandler, {
      method: "POST",
      body: { email, formToken: formTokenAged(10) },
    });

    assert.equal(response.statusCode, 200);
    assert.equal(emailsSent(calls).length, 1);
  });
});

test("subscribe endpoint rejects cross-site requests without calling Resend", async () => {
  await withConfiguredApi({}, async (calls) => {
    const response = await callHandler(subscribeHandler, {
      method: "POST",
      headers: { accept: "application/json", "sec-fetch-site": "cross-site" },
      body: { email, formToken: formTokenAged(10) },
    });

    assert.equal(response.statusCode, 400);
    assert.equal(calls.length, 0);
  });
});

test("subscribe endpoint accepts same-origin requests", async () => {
  await withConfiguredApi({}, async (calls) => {
    const response = await callHandler(subscribeHandler, {
      method: "POST",
      headers: { accept: "application/json", "sec-fetch-site": "same-origin" },
      body: { email, formToken: formTokenAged(10) },
    });

    assert.equal(response.statusCode, 200);
    assert.equal(emailsSent(calls).length, 1);
  });
});

test("subscribe endpoint logs rejections with a reason and no plaintext address", async () => {
  const lines = [];
  const originalWarn = console.warn;
  console.warn = (...args) => lines.push(args.join(" "));
  try {
    await withConfiguredApi({}, async () => {
      await callHandler(subscribeHandler, { method: "POST", body: { email } });
    });
  } finally {
    console.warn = originalWarn;
  }
  assert.equal(lines.length, 1);
  assert.match(lines[0], /reason=invalid-form-token/);
  assert.match(lines[0], /emailHash=[0-9a-f]{64}/);
  assert.ok(!lines[0].includes(email));
});

test("Turnstile rejects a failed verification without sending a mail", async () => {
  await withConfiguredApi({
    "POST /turnstile/v0/siteverify": [200, { success: false }],
  }, async (calls) => {
    const response = await callHandler(subscribeHandler, {
      method: "POST",
      body: { email, formToken: formTokenAged(10), "cf-turnstile-response": "bad" },
    });

    assert.equal(response.statusCode, 400);
    assert.match(response.body, /Sicherheitsprüfung/);
    assert.equal(emailsSent(calls).length, 0);
  }, { TURNSTILE_SECRET_KEY: "turnstile-secret" });
});

test("Turnstile requires a response when enabled", async () => {
  await withConfiguredApi({}, async (calls) => {
    const response = await callHandler(subscribeHandler, {
      method: "POST",
      body: { email, formToken: formTokenAged(10) },
    });

    assert.equal(response.statusCode, 400);
    assert.match(response.body, /Sicherheitsprüfung/);
    assert.equal(calls.length, 0);
  }, { TURNSTILE_SECRET_KEY: "turnstile-secret" });
});

test("Turnstile lets a verified signup through", async () => {
  await withConfiguredApi({
    "POST /turnstile/v0/siteverify": [200, { success: true }],
  }, async (calls) => {
    const response = await callHandler(subscribeHandler, {
      method: "POST",
      headers: { accept: "application/json", "x-forwarded-for": "203.0.113.7, 10.0.0.1" },
      body: { email, formToken: formTokenAged(10), "cf-turnstile-response": "good" },
    });

    assert.equal(response.statusCode, 200);
    assert.equal(emailsSent(calls).length, 1);
    const verification = calls.find((call) => call.path === "/turnstile/v0/siteverify");
    assert.deepEqual(verification.body, { secret: "turnstile-secret", response: "good", remoteip: "203.0.113.7" });
  }, { TURNSTILE_SECRET_KEY: "turnstile-secret" });
});

test("Turnstile is skipped without a secret", async () => {
  await withConfiguredApi({}, async (calls) => {
    const response = await callHandler(subscribeHandler, {
      method: "POST",
      body: { email, formToken: formTokenAged(10) },
    });

    assert.equal(response.statusCode, 200);
    assert.ok(!calls.some((call) => call.path === "/turnstile/v0/siteverify"));
  });
});

test("token endpoint hands out a form token", async () => {
  await withConfiguredApi({}, async () => {
    const response = await callHandler(tokenHandler, { method: "GET" });

    assert.equal(response.statusCode, 200);
    assert.equal(response.headers["Cache-Control"], "no-store");
    const { token } = JSON.parse(response.body);
    assert.ok(verifyFormToken(token, secret, Date.now() + 5_000));
  });
});

test("token endpoint only allows GET", async () => {
  const response = await callHandler(tokenHandler, { method: "POST" });

  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, "GET");
});

test("token endpoint is unavailable without a usable secret", async () => {
  await withConfiguredApi({}, async () => {
    process.env.NEWSLETTER_TOKEN_SECRET = "short";
    const response = await callHandler(tokenHandler, { method: "GET" });

    assert.equal(response.statusCode, 503);
  });
});

test("subscribe endpoint accepts the honeypot without calling Resend", async () => {
  const response = await callHandler(subscribeHandler, {
    method: "POST",
    body: { email: "bot@example.de", website: "https://spam.example" },
  });

  assert.equal(response.statusCode, 200);
  assert.match(response.body, /bestätige/i);
});

test("subscribe endpoint treats a repeated signup within the day as already sent", async () => {
  await withConfiguredApi({
    "POST /emails": [409, {
      statusCode: 409,
      name: "invalid_idempotent_request",
      message: "Same idempotency key used with a different request payload.",
    }],
  }, async () => {
    const response = await callHandler(subscribeHandler, {
      method: "POST",
      body: { email, formToken: formTokenAged(10) },
    });

    assert.equal(response.statusCode, 200);
    assert.match(response.body, /bestätige/i);
  });
});

test("subscribe endpoint still reports real delivery failures", async () => {
  await withConfiguredApi({
    "POST /emails": [422, { statusCode: 422, name: "validation_error", message: "Invalid from address." }],
  }, async () => {
    const response = await callHandler(subscribeHandler, {
      method: "POST",
      body: { email, formToken: formTokenAged(10) },
    });

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

// --- Kontaktformular ---

const contactBody = (overrides = {}) => ({
  name: "Erika Muster",
  email,
  topic: "projekt",
  message: "Hallo Ben,\nich brauche eine App.",
  formToken: createFormToken(secret, Date.now() - 10_000, "contact"),
  ...overrides,
});
const contactRequest = (body, headers = {}) => ({ method: "POST", headers: { accept: "application/json", ...headers }, body });

test("contact form sends the message to the owner with the visitor as reply-to", async () => {
  await withConfiguredApi({}, async (calls) => {
    const response = await callHandler(contactHandler, contactRequest(contactBody()));
    assert.equal(response.statusCode, 200);
    const [mail] = emailsSent(calls);
    assert.equal(mail.body.to, "mail@benkohler.de");
    assert.equal(mail.body.reply_to, email);
    assert.match(mail.body.subject, /App-Projekt anfragen: Erika Muster/);
    assert.match(mail.body.text, /ich brauche eine App/);
  });
});

test("contact form escapes HTML and keeps header values on one line", async () => {
  await withConfiguredApi({}, async (calls) => {
    await callHandler(contactHandler, contactRequest(contactBody({
      name: "Eve\r\nBcc: x@evil.de",
      message: "<script>alert(1)</script>",
    })));
    const [mail] = emailsSent(calls);
    assert.ok(!/[\r\n]/.test(mail.body.subject));
    assert.ok(!mail.body.html.includes("<script>"));
    assert.ok(mail.body.html.includes("&lt;script&gt;"));
  });
});

test("contact form refuses a newsletter token, a missing token and cross-site posts", async () => {
  await withConfiguredApi({}, async (calls) => {
    const wrongPurpose = await callHandler(contactHandler, contactRequest(contactBody({ formToken: formTokenAged(10) })));
    const noToken = await callHandler(contactHandler, contactRequest(contactBody({ formToken: undefined })));
    const crossSite = await callHandler(contactHandler, contactRequest(contactBody(), { "sec-fetch-site": "cross-site" }));
    assert.deepEqual([wrongPurpose.statusCode, noToken.statusCode, crossSite.statusCode], [400, 400, 400]);
    assert.equal(emailsSent(calls).length, 0);
  });
});

test("contact form swallows honeypot posts and rejects invalid input without sending", async () => {
  await withConfiguredApi({}, async (calls) => {
    const trap = await callHandler(contactHandler, contactRequest(contactBody({ website: "http://spam.example" })));
    const badEmail = await callHandler(contactHandler, contactRequest(contactBody({ email: "nope" })));
    const empty = await callHandler(contactHandler, contactRequest(contactBody({ message: "  " })));
    const tooLong = await callHandler(contactHandler, contactRequest(contactBody({ message: "x".repeat(5001) })));
    assert.deepEqual([trap.statusCode, badEmail.statusCode, empty.statusCode, tooLong.statusCode], [200, 400, 400, 400]);
    assert.equal(emailsSent(calls).length, 0);
  });
});

test("contact form reports a failed Resend delivery", async () => {
  await withConfiguredApi({ "POST /emails": [500, { name: "application_error", message: "boom" }] }, async () => {
    const response = await callHandler(contactHandler, contactRequest(contactBody()));
    assert.equal(response.statusCode, 502);
  });
});

test("token endpoint issues contact tokens that only the contact form accepts", async () => {
  await withConfiguredApi({}, async () => {
    const response = await callHandler(tokenHandler, { method: "GET", url: "/api/newsletter-token?purpose=contact" });
    const { token } = JSON.parse(response.body);
    const later = Date.now() + 5_000;
    assert.ok(verifyFormToken(token, secret, later, "contact"));
    assert.ok(!verifyFormToken(token, secret, later));
  });
});
