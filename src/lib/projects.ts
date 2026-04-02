import type { CollectionEntry } from 'astro:content';

export const sortProjectEntries = (entries: CollectionEntry<'projects'>[]) =>
	entries.sort(
		(first, second) =>
			(first.data.order ?? Number.MAX_SAFE_INTEGER) -
				(second.data.order ?? Number.MAX_SAFE_INTEGER) ||
			second.data.year.localeCompare(first.data.year, 'zh-CN') ||
			first.data.title.localeCompare(second.data.title, 'zh-CN'),
	);

export type HomeProjectShowcaseItem = {
	title: string;
	meta: string;
	description: string;
	href: string;
	isMore?: boolean;
};

export const buildHomeProjectShowcaseItems = (
	entries: CollectionEntry<'projects'>[],
	limit = 2,
): HomeProjectShowcaseItem[] => {
	const showcaseItems = entries.slice(0, limit).map((entry) => ({
		title: entry.data.title,
		meta: `${entry.data.status} · ${entry.data.year}`,
		description: entry.data.summary,
		href: `/projects/${entry.id}/`,
	}));

	return [
		...showcaseItems,
		{
			title: '更多项目',
			meta: 'Projects',
			description: '进入完整项目页，查看全部项目内容和后续更新。',
			href: '/projects/',
			isMore: true,
		},
	];
};
