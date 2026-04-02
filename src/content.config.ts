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

const projects = defineCollection({
	loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			summary: z.string(),
			teaser: z.string().optional().default(''),
			tags: z.array(z.string().trim().min(1)).optional().default([]),
			status: z.string(),
			year: z.string(),
			role: z.string(),
			stack: z.array(z.string().trim().min(1)).optional().default([]),
			order: z.number().int().optional(),
			coverImage: z
				.union([
					z.string().trim().regex(/^\/.+/, 'Public cover images must start with "/"'),
					image(),
				])
				.optional(),
		}),
});

const reviews = defineCollection({
	loader: glob({ base: './src/content/reviews', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			mediaType: z.enum(['动画', '游戏']),
			score: z.number().min(0).max(10),
			pubDate: z.coerce.date(),
			tags: z.array(z.string().trim().min(1)).optional().default([]),
			coverImage: z
				.union([
					z.string().trim().regex(/^\/.+/, 'Public cover images must start with "/"'),
					image(),
				])
				.optional(),
		}),
});

export const collections = { blog, projects, reviews };


