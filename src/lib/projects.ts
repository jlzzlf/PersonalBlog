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
	label: string;
	keywords: string[];
	description: string;
	href: string;
	isMore?: boolean;
};

const unique = (items: string[]) => [...new Set(items.filter(Boolean))];

const buildProjectLabel = (entry: CollectionEntry<'projects'>) => {
	const source = `${entry.data.title} ${entry.data.summary} ${entry.data.teaser}`.toLowerCase();

	if (source.includes('吸血鬼') || source.includes('survivor') || source.includes('生存')) {
		return '2D Survival Game';
	}

	const [primaryTag] = entry.data.tags;
	return primaryTag ? `${primaryTag} Project` : 'Game Project';
};

const buildProjectKeywords = (entry: CollectionEntry<'projects'>) => {
	const source = `${entry.data.title} ${entry.data.summary} ${entry.data.teaser} ${entry.body}`;
	const highlightedKeywords = ['对象池', '自动战斗', '批量敌人生成', '目标扫描系统', 'AI生成'].filter((keyword) =>
		source.includes(keyword),
	);

	return unique([...highlightedKeywords, ...entry.data.stack, ...entry.data.tags]).slice(0, 3);
};

const sortHomeProjectEntries = (entries: CollectionEntry<'projects'>[]) =>
	[...entries].sort(
		(first, second) =>
			second.data.year.localeCompare(first.data.year, 'zh-CN') ||
			(first.data.order ?? Number.MAX_SAFE_INTEGER) -
				(second.data.order ?? Number.MAX_SAFE_INTEGER) ||
			first.data.title.localeCompare(second.data.title, 'zh-CN'),
	);

export const buildHomeProjectShowcaseItems = (
	entries: CollectionEntry<'projects'>[],
	limit = 4,
): HomeProjectShowcaseItem[] => {
	const showcaseItems = sortHomeProjectEntries(entries).slice(0, limit).map((entry) => ({
		title: entry.data.title,
		meta: `${entry.data.status} · ${entry.data.year}`,
		label: buildProjectLabel(entry),
		keywords: buildProjectKeywords(entry),
		description: entry.data.summary,
		href: `/projects/${entry.id}/`,
	}));

	return [
		...showcaseItems,
		{
			title: '更多项目',
			meta: 'Projects',
			label: 'Portfolio',
			keywords: [],
			description: '进入完整项目页，查看全部项目内容和后续更新。',
			href: '/projects/',
			isMore: true,
		},
	];
};
