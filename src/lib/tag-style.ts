const TAG_COLOR_VARIANTS = [
	{
		bg: 'rgba(226, 244, 248, 0.9)',
		border: 'rgba(198, 215, 219, 0.56)',
		color: 'var(--color-link-hover)',
	},
	{
		bg: 'rgba(198, 215, 219, 0.62)',
		border: 'rgba(198, 215, 219, 0.92)',
		color: '#a4e1ff',
	},
	{
		bg: 'rgba(198, 215, 219, 0.72)',
		border: 'rgba(198, 215, 219, 0.94)',
		color: '#c6d7db',
	},
	{
		bg: 'rgba(198, 215, 219, 0.82)',
		border: 'rgba(198, 215, 219, 0.72)',
		color: 'var(--color-link-hover)',
	},
];

export const getTagColorStyle = (tag: string) => {
	let hash = 0;
	for (const character of tag) {
		hash = (hash * 33 + character.charCodeAt(0)) >>> 0;
	}

	const variant = TAG_COLOR_VARIANTS[hash % TAG_COLOR_VARIANTS.length];
	return `--tag-bg: ${variant.bg}; --tag-border: ${variant.border}; --tag-color: ${variant.color};`;
};

export const buildSortedTagCounts = (
	items: Array<{
		data: {
			tags?: string[];
		};
	}>,
) => {
	const tagCountMap = items.reduce((map, item) => {
		for (const tag of item.data.tags ?? []) {
			map.set(tag, (map.get(tag) ?? 0) + 1);
		}

		return map;
	}, new Map<string, number>());

	return Array.from(tagCountMap.entries())
		.sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0], 'zh-CN'))
		.map(([tag, count]) => ({ tag, count }));
};
