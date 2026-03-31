import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			category: z.enum(['学习记录', '技术笔记', '面试整理', '随想随笔']),
			tags: z.array(z.string().trim().min(1)).optional().default([]),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			coverImage: z
				.union([
					z.string().trim().regex(/^\/.+/, 'Public cover images must start with "/"'),
					image(),
				])
				.optional(),
		}),
});

export const collections = { blog };
