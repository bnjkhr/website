import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  PAGES,
  blogPostPath,
  formatDate,
  langFromPath,
  otherLang,
  pagePath,
  toLang,
  ui,
} from "../src/i18n/index.ts";
import { buildRedirects } from "../scripts/gen-lang-redirects.mjs";
import { blogTranslations } from "../scripts/translations.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const vercel = JSON.parse(readFileSync(`${root}vercel.json`, "utf8"));

// Alle Schlüssel eines verschachtelten Wörterbuchs als Pfadliste.
const keyPaths = (value, prefix = "") =>
  Object.entries(value).flatMap(([key, child]) =>
    child && typeof child === "object" ? keyPaths(child, `${prefix}${key}.`) : [`${prefix}${key}`]);

test("every page has a German path without prefix and an English path under /en/", () => {
  for (const [key, paths] of Object.entries(PAGES)) {
    assert.ok(paths.de.startsWith("/") && !paths.de.startsWith("/en/"), `${key}: de`);
    assert.ok(paths.en.startsWith("/en/"), `${key}: en`);
    assert.equal(pagePath(key, "de"), paths.de);
    assert.equal(pagePath(key, "en"), paths.en);
  }
  assert.equal(pagePath("home", "en"), "/en/");
  assert.equal(pagePath("hire", "en"), "/en/hire-an-app-developer/");
});

test("language helpers", () => {
  assert.equal(otherLang("de"), "en");
  assert.equal(otherLang("en"), "de");
  assert.equal(langFromPath("/"), "de");
  assert.equal(langFromPath("/blog/x/"), "de");
  assert.equal(langFromPath("/en"), "en");
  assert.equal(langFromPath("/en/blog/"), "en");
  assert.equal(langFromPath("/english-is-not-a-prefix/"), "de");
  assert.equal(toLang("en"), "en");
  assert.equal(toLang("fr"), "de");
  assert.equal(toLang(undefined), "de");
  assert.equal(blogPostPath({ id: "hello" }, "de"), "/blog/hello/");
  assert.equal(blogPostPath("hello", "en"), "/en/blog/hello/");
});

test("dates are formatted per language", () => {
  const date = new Date("2026-10-05T12:00:00Z");
  assert.equal(formatDate(date, "de"), "05. Oktober 2026");
  assert.equal(formatDate(date, "en"), "5 October 2026");
});

test("German and English UI dictionaries have the same keys and no empty texts", () => {
  assert.deepEqual(keyPaths(ui.en), keyPaths(ui.de));
  for (const lang of ["de", "en"]) {
    for (const path of keyPaths(ui[lang])) {
      const text = path.split(".").reduce((node, key) => node[key], ui[lang]);
      assert.ok(typeof text === "string" && text.trim(), `${lang}: ${path}`);
    }
  }
});

test("language redirects only touch German entry pages and respect the cookie", () => {
  const redirects = buildRedirects();
  assert.ok(redirects.length >= 5);
  for (const redirect of redirects) {
    assert.equal(redirect.statusCode, 307);
    assert.ok(redirect.destination.startsWith("/en/"), redirect.source);
    assert.ok(!redirect.source.startsWith("/en"), redirect.source);
    assert.ok(!/^\/(api|images|fonts|logo|css|_astro)\b/.test(redirect.source), redirect.source);
    assert.ok(!/\.\w+$/.test(redirect.source), `kein Asset/Feed: ${redirect.source}`);
    assert.deepEqual(redirect.has, [{ type: "header", key: "accept-language", value: "^en.*" }]);
    assert.deepEqual(redirect.missing, [{ type: "cookie", key: "lang" }]);
  }
  const sources = redirects.map((redirect) => redirect.source);
  for (const key of ["home", "hire", "ulm", "cost", "blog"]) assert.ok(sources.includes(PAGES[key].de), key);
  assert.ok(!sources.includes(PAGES.rss.de));
});

test("every translated blog post gets a redirect to its English counterpart", () => {
  const redirects = buildRedirects();
  for (const { de, en } of blogTranslations()) {
    const redirect = redirects.find((entry) => entry.source === blogPostPath(de, "de"));
    assert.equal(redirect?.destination, blogPostPath(en, "en"));
  }
});

test("vercel.json is up to date with the generator", () => {
  execFileSync(process.execPath, ["scripts/gen-lang-redirects.mjs", "--check"], { cwd: root, stdio: "pipe" });
  assert.deepEqual(vercel.redirects, buildRedirects());
});

test("security headers in vercel.json stay in place", () => {
  const [rule] = vercel.headers;
  assert.equal(rule.source, "/(.*)");
  const headers = Object.fromEntries(rule.headers.map(({ key, value }) => [key, value]));
  assert.match(headers["Content-Security-Policy"], /frame-ancestors 'none'/);
  assert.match(headers["Content-Security-Policy"], /script-src 'self' 'unsafe-inline' https:\/\/challenges\.cloudflare\.com/);
  assert.equal(headers["X-Frame-Options"], "DENY");
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
});
