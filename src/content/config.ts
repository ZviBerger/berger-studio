import { defineCollection, z } from 'astro:content';

const portfolioCollection = defineCollection({
    schema: z.object({
        title: z.string(),
        category: z.enum(['מגורים', 'מסחרי', 'עיצוב פנים', 'אדריכלות']),
        description: z.string(),
        publishDate: z.date(),
        coverImage: z.string().optional(),
        featured: z.boolean().default(false),
    })
});

const journalCollection = defineCollection({
    schema: z.object({
        title: z.string(),
        publishDate: z.date(),
        excerpt: z.string(),
        coverImage: z.string().optional(),
    })
});

export const collections = {
    'portfolio': portfolioCollection,
    'journal': journalCollection,
};

