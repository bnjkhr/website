import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    heroImage: z.string().min(1).optional(),
    heroImageAlt: z.string().min(1).optional(),
    heroImageCredit: z.string().min(1).optional(),
    heroImageCreditUrl: z.url().optional(),
    newsletterSubject: z.string().optional(),
    newsletterPreview: z.string().optional(),
  }),
});

export const collections = { blog };
