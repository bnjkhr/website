import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const postSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  // Titelbild liegt im Kopf des Beitrags hinter Titel und Untertitel; Quelle steht darunter.
  heroImage: z.string().min(1),
  heroImageAlt: z.string().min(1),
  heroImageCredit: z.string().min(1),
  heroImageCreditUrl: z.url(),
  newsletterSubject: z.string().optional(),
  newsletterPreview: z.string().optional(),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: postSchema,
});

// Englische Beiträge: Dateiname = englischer Slug, translationOf = id des deutschen Beitrags.
const blogEn = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog-en" }),
  schema: postSchema.extend({ translationOf: z.string().min(1) }),
});

export const collections = { blog, blogEn };
