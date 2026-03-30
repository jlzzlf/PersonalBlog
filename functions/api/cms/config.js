const DEFAULT_BRANCH = 'main';
const DEFAULT_AUTH_SCOPE = 'repo';
const DEFAULT_LOCALE = 'zh_Hant';

function json(data, init = {}) {
	return new Response(JSON.stringify(data, null, 2), {
		...init,
		headers: {
			'Cache-Control': 'no-store',
			'Content-Type': 'application/json; charset=utf-8',
			...init.headers,
		},
	});
}

function getString(value) {
	return typeof value === 'string' ? value.trim() : '';
}

function buildPostFields() {
	return [
		{
			label: '标题',
			name: 'title',
			widget: 'string',
		},
		{
			label: '摘要',
			name: 'description',
			widget: 'text',
		},
		{
			label: '发布日期',
			name: 'pubDate',
			widget: 'datetime',
			date_format: 'YYYY-MM-DD',
			time_format: false,
			picker_utc: false,
		},
		{
			label: '更新日期',
			name: 'updatedDate',
			widget: 'datetime',
			required: false,
			date_format: 'YYYY-MM-DD',
			time_format: false,
			picker_utc: false,
		},
		{
			label: '封面图',
			name: 'heroImage',
			widget: 'image',
			required: false,
			hint: '图片会上传到 public/uploads，并以 /uploads/... 路径写入 frontmatter。',
		},
		{
			label: '正文',
			name: 'body',
			widget: 'markdown',
		},
	];
}

function buildCollection({
	name,
	label,
	description,
	extension,
}) {
	return {
		name,
		label,
		label_singular: '文章',
		description,
		folder: 'src/content/blog',
		create: true,
		delete: true,
		extension,
		format: 'frontmatter',
		slug: '{{year}}-{{month}}-{{day}}-{{slug}}',
		summary: '{{title}} · {{pubDate}}',
		preview_path: 'blog/{{slug}}',
		editor: {
			preview: false,
		},
		sortable_fields: ['pubDate', 'updatedDate', 'title', 'commit_date', 'commit_author'],
		fields: buildPostFields(),
	};
}

export async function onRequestGet(context) {
	const repo = getString(context.env.CMS_GITHUB_REPO);
	const clientId = getString(context.env.GITHUB_OAUTH_CLIENT_ID);
	const clientSecret = getString(context.env.GITHUB_OAUTH_CLIENT_SECRET);
	const branch = getString(context.env.CMS_GITHUB_BRANCH) || DEFAULT_BRANCH;
	const authScope = getString(context.env.CMS_GITHUB_AUTH_SCOPE) || DEFAULT_AUTH_SCOPE;
	const locale = getString(context.env.CMS_ADMIN_LOCALE) || DEFAULT_LOCALE;
	const requestUrl = new URL(context.request.url);
	const origin = requestUrl.origin;
	const siteUrl = getString(context.env.PUBLIC_SITE_URL) || origin;
	const displayUrl = getString(context.env.PUBLIC_DISPLAY_URL) || siteUrl;

	const missing = [];
	if (!repo) missing.push('CMS_GITHUB_REPO');
	if (!clientId) missing.push('GITHUB_OAUTH_CLIENT_ID');
	if (!clientSecret) missing.push('GITHUB_OAUTH_CLIENT_SECRET');

	if (missing.length > 0) {
		return json(
			{
				message: `后台尚未完成配置，缺少环境变量：${missing.join(', ')}`,
			},
			{ status: 500 },
		);
	}

	return json({
		load_config_file: false,
		locale,
		site_url: siteUrl,
		display_url: displayUrl,
		show_preview_links: true,
		publish_mode: 'editorial_workflow',
		media_folder: 'public/uploads',
		public_folder: '/uploads',
		slug: {
			encoding: 'unicode',
			clean_accents: false,
			sanitize_replacement: '-',
		},
		editor: {
			preview: false,
		},
		backend: {
			name: 'github',
			repo,
			branch,
			auth_scope: authScope,
			site_domain: requestUrl.hostname,
			base_url: origin,
			auth_endpoint: 'api/cms/auth',
		},
		collections: [
			buildCollection({
				name: 'blog',
				label: '博客文章（Markdown）',
				description: '日常写作推荐使用这个集合。',
				extension: 'md',
			}),
			buildCollection({
				name: 'blog_mdx',
				label: '博客文章（MDX）',
				description: '当文章需要保留 MDX 语法或组件导入时使用。',
				extension: 'mdx',
			}),
		],
	});
}
