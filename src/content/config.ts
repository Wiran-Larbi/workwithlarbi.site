import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
    legacyUrl: z.string().url().optional(),
  }),
});

/** Case studies / client work — same shape as posts; lives under `/work/`. */
const work = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
    legacyUrl: z.string().url().optional(),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    url: z.string().url().optional(),
    year: z.number().optional(),
    /** Prefer this for card footer; falls back to Jan 1 of `year` if omitted */
    started: z.coerce.date().optional(),
    role: z.string().optional(),
    stack: z.array(z.string()).optional(),
    /** From Webflow / legacy exports (e.g. App, Blog) */
    category: z.string().optional(),
    /** From Webflow / legacy exports (e.g. Front Burner) */
    burnerLevel: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    status: z.enum(['active', 'paused', 'retired']).default('active'),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts, work, projects };
