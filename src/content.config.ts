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
			category: z.enum(['学习记录', '技术笔记', '随想随笔']),
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

const interviews = defineCollection({
	loader: glob({ base: './src/content/interviews', pattern: '**/*.{md,mdx}' }),
	schema: () =>
		z.object({
			title: z.string(),
			description: z.string(),
			subject: z.string().trim().min(1).default('Unity / C#'),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
		}),
});

const projectLogs = defineCollection({
	loader: glob({ base: './src/content/project-logs', pattern: '**/*.{md,mdx}' }),
	schema: () =>
		z.object({
			title: z.string(),
			description: z.string(),
			project: z.string().trim().min(1),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
		}),
});

export const collections = { blog, projects, interviews, projectLogs };


