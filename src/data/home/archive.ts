export const archiveEntryContent = {
	copy: '完整的日历和时间线已经拆到独立页面，首页只保留一个稳定入口。这样你可以继续从首页进入归档，但不再让首页承担过长列表和复杂筛选。',
	actions: [
		{ label: '打开归档页', href: '/archive/', variant: 'primary' },
		{ label: '查看博客列表', href: '/blog/', variant: 'secondary' },
	],
	features: [
		'按当前月份日历筛选当天发布的文章',
		'完整时间线独立展开，不受首页卡片高度限制',
		'从年份脉络直接进入具体文章页面',
	],
} as const;
