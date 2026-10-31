// Schreibt die automatische Sprachweiche in vercel.json (Schlüssel `redirects`).
// Quelle: Routenmap in src/i18n und `translationOf` der englischen Beiträge.
//
//   node scripts/gen-lang-redirects.mjs           schreibt vercel.json
//   node scripts/gen-lang-redirects.mjs --check   prüft nur, ob vercel.json aktuell ist (Exit 1 sonst)
//
// Regel: Wer Englisch als erste Sprache sendet (Accept-Language beginnt mit „en“) und
// noch kein `lang`-Cookie hat, bekommt bei einer deutschen Einstiegsseite einen 307 auf
// die englische Entsprechung. Das Cookie (Sprachumschalter) gewinnt immer. Crawler ohne
// Accept-Language bleiben deutsch. Assets und /api sind nie betroffen, weil nur die
// aufgelisteten Seitenpfade als Quelle dienen.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { PAGES, blogPostPath } from "../src/i18n/index.ts";
import { blogTranslations } from "./translations.mjs";

const VERCEL_JSON = fileURLToPath(new URL("../vercel.json", import.meta.url));

// Der Feed wird von Readern abgerufen, nicht von Menschen im Browser: nie umleiten.
const SKIPPED_PAGES = new Set(["rss"]);

export function buildRedirects() {
  const pairs = [
    ...Object.entries(PAGES)
      .filter(([key]) => !SKIPPED_PAGES.has(key))
      .map(([, paths]) => ({ from: paths.de, to: paths.en })),
    ...blogTranslations().map(({ de, en }) => ({ from: blogPostPath(de, "de"), to: blogPostPath(en, "en") })),
  ];
  const redirects = [];
  for (const { from, to } of pairs) {
    // Mit und ohne abschließenden Slash, damit die Weiche nicht von dessen Normalisierung abhängt.
    for (const source of from === "/" ? [from] : [from, from.slice(0, -1)]) {
      redirects.push({
        source,
        destination: to,
        statusCode: 307,
        has: [{ type: "header", key: "accept-language", value: "^en.*" }],
        missing: [{ type: "cookie", key: "lang" }],
      });
    }
  }
  return redirects;
}

export function renderVercelJson(current) {
  const config = JSON.parse(current);
  const { redirects: _old, ...rest } = config;
  // `redirects` steht direkt hinter `$schema`, alle übrigen Schlüssel behalten ihre Reihenfolge.
  const { $schema, ...others } = rest;
  const next = { ...($schema ? { $schema } : {}), redirects: buildRedirects(), ...others };
  return `${JSON.stringify(next, null, 2)}\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const current = readFileSync(VERCEL_JSON, "utf8");
  const expected = renderVercelJson(current);
  if (process.argv.includes("--check")) {
    if (current !== expected) {
      console.error("vercel.json ist nicht aktuell. Bitte `npm run gen:redirects` ausführen.");
      process.exit(1);
    }
    console.log("vercel.json ist aktuell.");
  } else {
    writeFileSync(VERCEL_JSON, expected);
    console.log(`vercel.json aktualisiert (${buildRedirects().length} Weichen).`);
  }
}
