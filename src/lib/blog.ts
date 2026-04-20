import { getCollection, type CollectionEntry } from 'astro:content';

export const sortBlogEntries = (entries: CollectionEntry<'blog'>[]) =>
	[...entries].sort((first, second) => second.data.pubDate.valueOf() - first.data.pubDate.valueOf());

export const getSortedBlogEntries = async () => sortBlogEntries(await getCollection('blog'));
