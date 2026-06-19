import { getCollection, type CollectionEntry } from 'astro:content';

export const BLOG_CATEGORIES = ['学习记录', '技术笔记', '随想随笔'] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];
export type BlogCategoryCount = {
	category: BlogCategory;
	count: number;
};

export const sortBlogEntries = (entries: CollectionEntry<'blog'>[]) =>
	[...entries].sort((first, second) => second.data.pubDate.valueOf() - first.data.pubDate.valueOf());

export const getSortedBlogEntries = async () => sortBlogEntries(await getCollection('blog'));

export const getBlogCategoryCounts = (entries: CollectionEntry<'blog'>[]): BlogCategoryCount[] =>
	BLOG_CATEGORIES.map((category) => ({
		category,
		count: entries.filter((entry) => entry.data.category === category).length,
	}));

export const getPostsByBlogCategory = (entries: CollectionEntry<'blog'>[], category: BlogCategory) =>
	entries.filter((entry) => entry.data.category === category);

export const getBlogCategoryPath = (category: BlogCategory) =>
	`/blog/type/${encodeURIComponent(category)}`;
