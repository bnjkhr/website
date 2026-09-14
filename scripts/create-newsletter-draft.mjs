import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import matter from "gray-matter";
import { marked } from "marked";
import { Resend } from "resend";

const slug = process.argv[2];
if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
  console.error("Aufruf: npm run newsletter:draft -- <beitrags-slug>");
  process.exit(1);
}

const required = ["RESEND_API_KEY", "RESEND_NEWSLETTER_SEGMENT_ID"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Fehlende Umgebungsvariablen: ${missing.join(", ")}`);
  process.exit(1);
}

const file = path.resolve("src/content/blog", `${slug}.md`);
const source = await fs.readFile(file, "utf8");
const { data, content } = matter(source);
if (!data.title || !data.description) {
  console.error("Der Beitrag braucht title und description im Frontmatter.");
  process.exit(1);
}
if (data.draft === true) {
  console.error("Für einen als draft markierten Beitrag wird kein Newsletter erzeugt.");
  process.exit(1);
}

const siteUrl = (process.env.SITE_URL || "https://benkohler.de").replace(/\/$/, "");
const canonicalUrl = `${siteUrl}/blog/${slug}/`;
let articleHtml = await marked.parse(content);
articleHtml = articleHtml
  .replaceAll('href="/', `href="${siteUrl}/`)
  .replaceAll('src="/', `src="${siteUrl}/`);

const html = `<div style="max-width:680px;margin:0 auto;padding:30px 20px;font-family:Arial,sans-serif;color:#162019;font-size:17px;line-height:1.65">
  <p style="margin:0 0 24px;color:#5c685f;font-size:13px">Ben Kohler · Neue Beiträge</p>
  <h1 style="margin:0 0 18px;font-size:38px;line-height:1.12">${data.title}</h1>
  <p style="margin:0 0 30px;color:#5c685f;font-size:19px">${data.description}</p>
  <div>${articleHtml}</div>
  <hr style="margin:38px 0;border:0;border-top:1px solid #cbd2c9">
  <p><a href="${canonicalUrl}" style="color:#9f321a;font-weight:700">Beitrag auf benkohler.de lesen</a></p>
  <p style="margin-top:34px;color:#5c685f;font-size:12px">Du erhältst diese E-Mail, weil du neue Beiträge abonniert hast. <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#5c685f">Abmelden</a></p>
</div>`;
const text = `${data.title}\n\n${content.trim()}\n\nBeitrag im Web: ${canonicalUrl}\n\nAbmelden: {{{RESEND_UNSUBSCRIBE_URL}}}`;

const resend = new Resend(process.env.RESEND_API_KEY);
const { data: result, error } = await resend.broadcasts.create({
  segmentId: process.env.RESEND_NEWSLETTER_SEGMENT_ID,
  topicId: process.env.RESEND_NEWSLETTER_TOPIC_ID || undefined,
  from: process.env.NEWSLETTER_FROM || "Ben Kohler <newsletter@benkohler.de>",
  replyTo: "mail@benkohler.de",
  name: `Blog: ${data.title}`,
  subject: data.newsletterSubject || data.title,
  previewText: data.newsletterPreview || data.description,
  html,
  text,
  send: false,
});

if (error) {
  console.error("Resend konnte den Entwurf nicht erstellen:", error.message);
  process.exit(1);
}

console.log(`Resend-Entwurf erstellt: ${result.id}`);
console.log("Der Entwurf wurde nicht versendet. Bitte in Resend prüfen und manuell freigeben.");
