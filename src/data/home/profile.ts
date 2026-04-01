export const profileContent = {
	lead: '你好，我是',
	name: '章立夫',
	role: 'Unity Developer',
	tags: ['#Unity开发', '#项目实践', '#生活记录'],
	introLines: ['这里是我的个人博客。', '我会在这里展示项目、记录学习、分享生活。'],
	note: '记录正在发生的事，也记录那些值得回看的瞬间。',
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
