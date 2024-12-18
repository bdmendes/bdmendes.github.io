import { z, defineCollection } from "astro:content";

const blogCollection = defineCollection({
    schema: ({ image }) => z.object({
        title: z.string(),
        hero: image().optional(),
        tags: z.array(z.string()).refine(items => new Set(items).size === items.length, {
            message: 'tags must be unique',
        }).optional(),
    }),
});

const slidesCollection = defineCollection({
    schema: () => z.object({
        title: z.string(),
        description: z.string(),
        tags: z.array(z.string()).refine(items => new Set(items).size === items.length, {
            message: 'tags must be unique',
        }).optional(),
    }),
});

export const collections = {
    'blog': blogCollection,
    'slides': slidesCollection,
}