import { getCollection, type CollectionEntry } from 'astro:content';

export const sortInterviewEntries = (entries: CollectionEntry<'interviews'>[]) =>
	[...entries].sort((first, second) => second.data.pubDate.valueOf() - first.data.pubDate.valueOf());

export const getSortedInterviewEntries = async () => sortInterviewEntries(await getCollection('interviews'));
