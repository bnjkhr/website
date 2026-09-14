import { createHmac, createHash, timingSafeEqual } from "node:crypto";

const TOKEN_TTL_SECONDS = 48 * 60 * 60;
// Bump when the consent text in the signup form or privacy policy changes.
export const CONSENT_VERSION = "2026-09-14";

export function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function isValidEmail(email) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function signature(payload, secret) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createConfirmationToken(email, secret, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({
    email,
    issuedAt: Math.floor(now / 1000),
    expiresAt: Math.floor(now / 1000) + TOKEN_TTL_SECONDS,
    consentVersion: CONSENT_VERSION,
  })).toString("base64url");
  return `${payload}.${signature(payload, secret)}`;
}

export function verifyConfirmationToken(token, secret, now = Date.now()) {
  const [payload, providedSignature, ...rest] = String(token || "").split(".");
  if (!payload || !providedSignature || rest.length > 0) return null;

  const expectedSignature = signature(payload, secret);
  const actual = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!isValidEmail(data.email) || !Number.isFinite(data.expiresAt)) return null;
    if (data.expiresAt < Math.floor(now / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

export function emailHash(email) {
  return createHash("sha256").update(email).digest("hex");
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function parseBody(body) {
  if (!body) return {};
  if (typeof body === "object") return body;
  try {
    return JSON.parse(body);
  } catch {
    return Object.fromEntries(new URLSearchParams(body));
  }
}

function confirmationForm(token) {
  if (!token) return "";
  return `<form method="post" action="/api/newsletter-confirm"><input type="hidden" name="token" value="${escapeHtml(token)}"><button type="submit">Abo bestätigen</button></form>`;
}

export function statusPage({ title, message, success = false, confirmToken }) {
  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex">
  <title>${escapeHtml(title)} · Ben Kohler</title>
  <style>
    @font-face{font-family:Inter;src:url('/fonts/Inter-latin.woff2') format('woff2');font-display:swap;font-weight:100 900}
    @font-face{font-family:Stack;src:url('/fonts/StackSansNotch-regular.woff2') format('woff2');font-display:swap}
    *{box-sizing:border-box}body{min-height:100vh;margin:0;display:grid;place-items:center;padding:24px;background:#eef1ea;color:#162019;font-family:Inter,sans-serif}
    main{width:min(680px,100%);padding:clamp(32px,7vw,70px);border:1px solid #162019;border-radius:28px;background:${success ? "#d2ef7c" : "#fbfcf8"};box-shadow:12px 14px 0 rgba(22,32,25,.1)}
    h1{margin:0;font-family:Stack,Inter,sans-serif;font-size:clamp(2.5rem,8vw,5rem);font-weight:400;line-height:.98;letter-spacing:-.035em}p{margin:22px 0 0;color:#455238;font-size:1.05rem;line-height:1.65}a{display:inline-flex;margin-top:30px;color:inherit;font-weight:750;text-underline-offset:4px}:focus-visible{outline:3px solid #e85835;outline-offset:4px}
    form{margin-top:30px}button{min-height:52px;padding:0 22px;border:1px solid #162019;border-radius:14px;background:#162019;color:#fff;font:inherit;font-weight:760;cursor:pointer}button:hover{background:#2b382f}
  </style>
</head>
<body><main><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p>${confirmationForm(confirmToken)}<a href="/blog/">Zum Blog</a></main></body>
</html>`;
}

// `payload` is the JSON body; `page` holds options that only the HTML page uses.
export function sendStatus(res, statusCode, payload, request, page = {}) {
  const wantsJson = String(request.headers.accept || "").includes("application/json");
  res.statusCode = statusCode;
  res.setHeader("Cache-Control", "no-store");
  if (wantsJson) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(payload));
    return;
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(statusPage({
    title: payload.title || (statusCode < 400 ? "Fast geschafft." : "Das hat nicht geklappt."),
    message: payload.message,
    success: statusCode < 400,
    ...page,
  }));
}
