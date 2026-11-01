// Liest die Frontmatter der englischen Blogbeiträge und liefert die Zuordnung
// englischer Slug ↔ deutscher Beitrag. Wird von der Sitemap-Konfiguration und
// vom Redirect-Generator genutzt (beide laufen außerhalb von Astro-Content).
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const root = fileURLToPath(new URL("..", import.meta.url));
const DE_DIR = join(root, "src/content/blog");
const EN_DIR = join(root, "src/content/blog-en");

function postFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).filter((file) => /\.(md|mdx)$/.test(file)).sort();
}

function readPost(directory, file) {
  const { data } = matter(readFileSync(join(directory, file), "utf8"));
  return { id: basename(file, extname(file)), draft: data.draft === true, translationOf: data.translationOf };
}

// Nur veröffentlichte Beiträge. Gibt [{ de, en }] zurück: de = Slug des deutschen,
// en = Slug des englischen Beitrags. Wirft bei einem Verweis auf einen unbekannten
// oder unveröffentlichten deutschen Beitrag, damit kein toter hreflang entsteht.
export function blogTranslations() {
  const german = new Map(postFiles(DE_DIR).map((file) => readPost(DE_DIR, file)).map((post) => [post.id, post]));
  const pairs = [];
  for (const file of postFiles(EN_DIR)) {
    const post = readPost(EN_DIR, file);
    if (post.draft) continue;
    if (typeof post.translationOf !== "string" || !post.translationOf) {
      throw new Error(`blog-en/${file}: translationOf fehlt`);
    }
    const original = german.get(post.translationOf);
    if (!original || original.draft) {
      throw new Error(`blog-en/${file}: translationOf "${post.translationOf}" ist kein veröffentlichter deutscher Beitrag`);
    }
    pairs.push({ de: original.id, en: post.id });
  }
  return pairs;
}
