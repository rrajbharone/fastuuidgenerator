import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    author: z.string().default('FastUUID Engineering Team'),
    category: z.string(),
    readingTime: z.string(),
    featured: z.boolean().default(false),
  }),
});

export const collections = {
  blog: blogCollection,
};
