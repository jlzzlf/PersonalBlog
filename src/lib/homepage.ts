import type { CollectionEntry } from 'astro:content';

type BlogPost = CollectionEntry<'blog'>;

export interface HomeRecentPost {
	title: string;
	href: string;
	description: string;
	pubDateLabel: string;
}

export interface HomeSiteStat {
	label: string;
	value: string;
}

export interface HomeArchiveEntryStat {
	label: string;
	value: string;
}

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

const stripMarkdown = (content: string) =>
	content
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`[^`]*`/g, ' ')
		.replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
		.replace(/\[[^\]]*]\([^)]+\)/g, ' ')
		.replace(/<[^>]*>/g, ' ')
		.replace(/[#>*_~=\-]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

const countContentUnits = (content: string) => {
	const matches = stripMarkdown(content).match(/[\u4e00-\u9fff]|[A-Za-z0-9]+/g);
	return matches?.length ?? 0;
};

const formatCompactCount = (value: number) =>
	new Intl.NumberFormat('en-US', {
		notation: 'compact',
		maximumFractionDigits: 1,
	}).format(value).toLowerCase();

const formatRelativeTime = (date: Date, reference = new Date()) => {
	const relativeTimeFormatter = new Intl.RelativeTimeFormat('zh-CN', {
		numeric: 'auto',
	});
	const diffSeconds = Math.round((date.getTime() - reference.getTime()) / 1000);
	const absSeconds = Math.abs(diffSeconds);

	if (absSeconds < 60) {
		return relativeTimeFormatter.format(diffSeconds, 'second');
	}

	const diffMinutes = Math.round(diffSeconds / 60);
	const absMinutes = Math.abs(diffMinutes);
	if (absMinutes < 60) {
		return relativeTimeFormatter.format(diffMinutes, 'minute');
	}

	const diffHours = Math.round(diffSeconds / 3600);
	const absHours = Math.abs(diffHours);
	if (absHours < 24) {
		return relativeTimeFormatter.format(diffHours, 'hour');
	}

	const diffDays = Math.round(diffSeconds / ONE_DAY_IN_MS);
	const absDays = Math.abs(diffDays);
	if (absDays < 30) {
		return relativeTimeFormatter.format(diffDays, 'day');
	}

	const diffMonths = Math.round(diffSeconds / (ONE_DAY_IN_MS * 30));
	const absMonths = Math.abs(diffMonths);
	if (absMonths < 12) {
		return relativeTimeFormatter.format(diffMonths, 'month');
	}

	const diffYears = Math.round(diffSeconds / (ONE_DAY_IN_MS * 365));
	return relativeTimeFormatter.format(diffYears, 'year');
};

const formatArchiveDate = (date: Date) =>
	new Intl.DateTimeFormat('zh-CN', {
		month: 'short',
		day: 'numeric',
	}).format(date);

export const buildHomePageViewModel = (posts: BlogPost[]) => {
	const archiveGroups = Array.from(
		posts.reduce((groups, post) => {
			const year = String(post.data.pubDate.getFullYear());
			const yearPosts = groups.get(year);
			if (yearPosts) {
				yearPosts.push(post);
			} else {
				groups.set(year, [post]);
			}
			return groups;
		}, new Map<string, BlogPost[]>()),
	);

	const recentPosts: HomeRecentPost[] = posts.slice(0, 2).map((post) => ({
		title: post.data.title,
		href: `/blog/${post.id}/`,
		description: post.data.description,
		pubDateLabel: formatArchiveDate(post.data.pubDate),
	}));

	const launchPost = posts.find((post) => post.id === 'first-post') ?? posts[posts.length - 1];
	const siteLaunchDate = launchPost?.data.pubDate ?? new Date();
	const latestUpdatedDate = posts.reduce((latest, post) => {
		const candidate = post.data.updatedDate ?? post.data.pubDate;
		return candidate > latest ? candidate : latest;
	}, siteLaunchDate);

	const siteStats: HomeSiteStat[] = [
		{
			label: '文章总数',
			value: String(posts.length),
		},
		{
			label: '建站天数',
			value: `${Math.max(1, Math.floor((Date.now() - siteLaunchDate.getTime()) / ONE_DAY_IN_MS))} 天`,
		},
		{
			label: '最后更新',
			value: formatRelativeTime(latestUpdatedDate),
		},
		{
			label: '全站字数',
			value: formatCompactCount(posts.reduce((total, post) => total + countContentUnits(post.body), 0)),
		},
	];

	const archiveEntryStats: HomeArchiveEntryStat[] = [
		{ label: '文章', value: `${posts.length} 篇` },
		{ label: '年份', value: `${archiveGroups.length} 年` },
		{ label: '最近更新', value: formatRelativeTime(latestUpdatedDate) },
	];

	return {
		recentPosts,
		siteStats,
		archiveEntryStats,
	};
};
