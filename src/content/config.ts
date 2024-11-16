import { z, defineCollection } from "astro:content";

const blogSchema = z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updatedDate: z.string().optional(),
    hero: z.string().optional(),
    badge: z.string().optional(),
    tags: z.array(z.string()).refine(items => new Set(items).size === items.length, {
        message: 'tags must be unique',
    }).optional(),
});
export type BlogSchema = z.infer<typeof blogSchema>;

export const collections = {
    'blog': defineCollection({ schema: blogSchema }),
}