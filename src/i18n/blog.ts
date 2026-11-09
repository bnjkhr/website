// Blog-Zuordnung zwischen den Sprachen. Nutzt die Content-Collections und läuft
// deshalb nur innerhalb von Astro (Seiten, Layouts), nicht in Node-Skripten.
import { getCollection, type CollectionEntry } from "astro:content";
import { blogPostPath, pagePath, type Lang } from "./index";

export type GermanPost = CollectionEntry<"blog">;
export type EnglishPost = CollectionEntry<"blogEn">;
export type BlogPost = GermanPost | EnglishPost;

const newestFirst = (a: BlogPost, b: BlogPost) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf();

/**
 * Auf Vercel-Vorschauen (nicht Produktion) zeigt der Blog auch Entwürfe, damit sie
 * vor der Veröffentlichung im echten Layout lesbar sind. Produktion zeigt nie Entwürfe.
 */
const showDrafts = process.env.VERCEL_ENV === "preview";

/** Veröffentlichte Beiträge einer Sprache, neueste zuerst (in Vorschauen samt Entwürfen). */
export async function getPosts(lang: "de"): Promise<GermanPost[]>;
export async function getPosts(lang: "en"): Promise<EnglishPost[]>;
export async function getPosts(lang: Lang): Promise<BlogPost[]>;
export async function getPosts(lang: Lang): Promise<BlogPost[]> {
  const posts: BlogPost[] = lang === "de"
    ? await getCollection("blog", ({ data }) => showDrafts || !data.draft)
    : await getCollection("blogEn", ({ data }) => showDrafts || !data.draft);
  return posts.sort(newestFirst);
}

/** Englische Übersetzung eines deutschen Beitrags (nur veröffentlichte). */
export async function englishCounterpart(germanId: string): Promise<EnglishPost | undefined> {
  return (await getPosts("en")).find((post) => post.data.translationOf === germanId);
}

/** Deutscher Originalbeitrag zu einem englischen Beitrag. */
export async function germanOriginal(post: EnglishPost): Promise<GermanPost | undefined> {
  return (await getPosts("de")).find((candidate) => candidate.id === post.data.translationOf);
}

/**
 * Ziel des Sprachumschalters für einen Beitrag. `isTranslation` ist nur wahr, wenn
 * es wirklich die Übersetzung desselben Beitrags ist (nur dann gehört ein hreflang
 * dazu). Ohne Gegenstück zeigt der Umschalter auf die Blogübersicht der anderen Sprache.
 */
export async function alternateForPost(post: BlogPost, lang: Lang): Promise<{ path: string; isTranslation: boolean }> {
  const target: Lang = lang === "de" ? "en" : "de";
  const counterpart = lang === "de"
    ? await englishCounterpart(post.id)
    : await germanOriginal(post as EnglishPost);
  return counterpart
    ? { path: blogPostPath(counterpart, target), isTranslation: true }
    : { path: pagePath("blog", target), isTranslation: false };
}
