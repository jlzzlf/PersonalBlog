export const profileContent = {
	lead: '你好，我是',
	name: '章立夫',
	role: 'Unity Developer',
	tags: ['#Unity开发', '#项目实践', '#生活记录'],
	introLines: ['我以事实校正立场，以代价衡量选择。不以标签代替判断，不把宏大目标的代价推给具体的人。'],
	note: '努力成为全栈开发者中...',
} as const;

export const profileActionButtons = [
	{
		label: 'Bilibili',
		imageSrc: '/images/bilibili-fill.png',
		alt: 'Bilibili 图标',
		href: 'https://space.bilibili.com/13105791?spm_id_from=333.1007.0.0',
	},
	{
		label: 'GitHub',
		imageSrc: '/images/github.png',
		alt: 'GitHub 图标',
		href: 'https://github.com/jlzzlf',
	},
	{
		label: '力扣',
		imageSrc: '/images/LeetCode.png',
		alt: '力扣图标',
		iconClass: 'is-leetcode',
		href: 'https://leetcode.cn/u/fdrksk6o8H/',
	},
] as const;

export const profileContacts = [
	{
		label: '邮箱',
		value: '1692754047@qq.com',
		href: 'mailto:1692754047@qq.com',
	},
	{
		label: '电话',
		value: '15852938328',
		href: 'tel:15852938328',
	},
] as const;
