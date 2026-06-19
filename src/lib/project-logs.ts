import { getCollection, type CollectionEntry } from 'astro:content';

export type HomeProjectLogItem = {
	title: string;
	project: string;
	description: string;
	pubDateLabel: string;
	href: string;
};

export const sortProjectLogEntries = (entries: CollectionEntry<'projectLogs'>[]) =>
	[...entries].sort((first, second) => second.data.pubDate.valueOf() - first.data.pubDate.valueOf());

export const getSortedProjectLogEntries = async () =>
	sortProjectLogEntries(await getCollection('projectLogs'));

const formatProjectLogDate = (date: Date) =>
	new Intl.DateTimeFormat('zh-CN', {
		month: 'short',
		day: 'numeric',
	}).format(date);

export const buildHomeProjectLogItems = (
	entries: CollectionEntry<'projectLogs'>[],
	limit = 4,
): HomeProjectLogItem[] =>
	sortProjectLogEntries(entries)
		.slice(0, limit)
		.map((entry) => ({
			title: entry.data.title,
			project: entry.data.project,
			description: entry.data.description,
			pubDateLabel: formatProjectLogDate(entry.data.pubDate),
			href: `/projects/logs/${entry.id}/`,
		}));
