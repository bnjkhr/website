import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { PAGES, blogPostPath } from "./src/i18n/index.ts";
import { blogTranslations } from "./scripts/translations.mjs";

const SITE = "https://benkohler.de";

// Paare aus deutscher und englischer Adresse (Seiten und Blogbeiträge). Die Pfade
// der Sprachen unterscheiden sich im Slug, deshalb kann das Sitemap-Plugin sie nicht
// selbst zuordnen; wir setzen die hreflang-Alternativen in `serialize` von Hand.
const pairs = [
  ...Object.entries(PAGES)
    .filter(([key]) => key !== "rss")
    .map(([, paths]) => ({ de: paths.de, en: paths.en })),
  ...blogTranslations().map(({ de, en }) => ({ de: blogPostPath(de, "de"), en: blogPostPath(en, "en") })),
];
const alternates = new Map();
for (const { de, en } of pairs) {
  const links = [
    { url: `${SITE}${de}`, lang: "de-DE" },
    { url: `${SITE}${en}`, lang: "en-US" },
    { url: `${SITE}${de}`, lang: "x-default" },
  ];
  alternates.set(`${SITE}${de}`, links);
  alternates.set(`${SITE}${en}`, links);
}

export default defineConfig({
  site: SITE,
  output: "static",
  integrations: [
    sitemap({
      i18n: { defaultLocale: "de", locales: { de: "de-DE", en: "en-US" } },
      serialize(item) {
        return { ...item, links: alternates.get(item.url) };
      },
    }),
  ],
});
