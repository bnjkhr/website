// Schutz vor Spam-Bots: Keine auslieferbare Datei darf Bens Mailadressen im Klartext enthalten.
// Läuft nach `astro build` (siehe `npm test`) und prüft zusätzlich die Quellen, die ausgeliefert werden.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

// Muster werden aus Teilen gebaut, damit dieser Test selbst keine Adresse enthält.
const AT = String.fromCharCode(64);
const PATTERNS = [
  new RegExp(`[\\w.+-]+${AT}benkohler\\.de`, "i"),
  new RegExp(`benny\\.kohler${AT}gmail\\.com`, "i"),
  new RegExp(`mailto:[^"'\\s>]*${AT}`, "i"),
  new RegExp(`${AT}benkohler\\.de`, "i"),
  /%40benkohler\.de/i,
  /&#0*64;|&#x0*40;|&commat;/i,
];
const TEXT_EXT = new Set([".html", ".js", ".mjs", ".json", ".xml", ".txt", ".css", ".webmanifest", ".md", ".svg", ".astro", ".ts"]);

const ROOTS = ["dist", "public", "api", "lib", "src", "scripts", ".env.example", "impressum.html", "indie-portfolio-preview.html", "site.webmanifest", "vercel.json"];

function* walk(path) {
  if (!existsSync(path)) return;
  if (statSync(path).isFile()) {
    yield path;
    return;
  }
  for (const entry of readdirSync(path)) {
    if (entry === "node_modules") continue;
    yield* walk(join(path, entry));
  }
}

test("keine ausgelieferte Datei enthält eine Mailadresse im Klartext", () => {
  assert.ok(existsSync("dist/index.html"), "dist/ fehlt – erst `npm run build` ausführen");
  const hits = [];
  let scanned = 0;
  for (const root of ROOTS) {
    for (const file of walk(root)) {
      if (!TEXT_EXT.has(extname(file)) && file !== ".env.example") continue;
      scanned++;
      const text = readFileSync(file, "utf8");
      for (const pattern of PATTERNS) {
        if (pattern.test(text)) hits.push(`${file} (${pattern})`);
      }
    }
  }
  assert.ok(scanned > 50, `zu wenige Dateien geprüft (${scanned})`);
  assert.deepEqual(hits, []);
});

test("Impressum und Datenschutz bieten die Adresse mit Fallback und externem Script an", () => {
  for (const file of ["dist/impressum.html", "dist/datenschutz.html"]) {
    const html = readFileSync(file, "utf8");
    assert.match(html, /data-mail-u="mail"/, `${file}: data-Attribute fehlen`);
    assert.match(html, /mail \[at\] benkohler \[punkt\] de/, `${file}: Fallback fehlt`);
    assert.match(html, /<script src="\/js\/mail\.js" defer><\/script>/, `${file}: Script fehlt`);
  }
  assert.ok(existsSync("dist/js/mail.js"));
});
