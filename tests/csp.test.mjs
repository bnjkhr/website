// Die CSP verbietet Inline-Skripte. Das gebaute HTML darf deshalb keine enthalten, sonst
// blockiert der Browser sie still. Läuft nach dem Build (siehe `npm test`).
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";

const pages = readdirSync("dist", { recursive: true }).filter((file) => file.endsWith(".html"));

test("no built page carries an inline script or event handler", () => {
  assert.ok(pages.length > 10, "build the site first");
  for (const page of pages) {
    const html = readFileSync(`dist/${page}`, "utf8");
    for (const [, attributes] of html.matchAll(/<script\b([^>]*)>/gi)) {
      // Daten wie JSON-LD werden nicht ausgeführt, die CSP betrifft sie nicht.
      assert.match(attributes, /\ssrc=|type="application\/ld\+json"/, `inline script in ${page}`);
    }
    assert.doesNotMatch(html, /<[a-z][^<>]*\son[a-z]+=["']/i, `inline event handler in ${page}`);
  }
});
