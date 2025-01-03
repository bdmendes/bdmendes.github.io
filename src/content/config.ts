import { z, defineCollection } from "astro:content";

const blogCollection = defineCollection({
    schema: ({ image }) => z.object({
        title: z.string(),
        hero: image().optional(),
        tags: z.array(z.string()).refine(items => new Set(items).size === items.length, {
            message: 'tags must be unique',
        }).optional(),
    }),
})

const slidesCollection = defineCollection({
    schema: () => z.object({
        title: z.string(),
        description: z.string(),
        tags: z.array(z.string()).refine(items => new Set(items).size === items.length, {
            message: 'tags must be unique',
        }).optional(),
    }),
})

const chessGamesCollection = defineCollection({
    schema: () => z.object({
        white: z.string()
            .refine(
                (name) =>
                    /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(name),
                { message: "White player's name must be two words with capitalized first letters." }
            ),
        black: z
            .string()
            .refine(
                (name) =>
                    /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(name),
                { message: "Black player's name must be two words with capitalized first letters." }
            ),
        tournament: z.string(),
        result: z
            .enum(["1-0", "0-1", "1/2-1/2"]),
        whiteElo: z
            .number()
            .optional()
            .refine((elo) => elo == null || (elo >= 0 && elo <= 3000), {
                message: "White ELO must be between 0 and 3000.",
            }),
        blackElo: z
            .number()
            .optional()
            .refine((elo) => elo == null || (elo >= 0 && elo <= 3000), {
                message: "Black ELO must be between 0 and 3000.",
            }),
        round: z.number().optional(),
        table: z.number().optional(),
    }),
});

export const collections = {
    'blog': blogCollection,
    'poetry': blogCollection,
    'slides': slidesCollection,
    'chess': chessGamesCollection,
}
