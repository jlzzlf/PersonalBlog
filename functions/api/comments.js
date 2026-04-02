const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';
const DEFAULT_REPO_OWNER = 'jlzzlf';
const DEFAULT_REPO_NAME = 'PersonalBlog';
const DEFAULT_DISCUSSION_CATEGORY_ID = 'DIC_kwDOR0Tyzs4C52ew';
const DEFAULT_DISCUSSION_LIMIT = 12;
const DEFAULT_COMMENT_LIMIT = 8;
const DEFAULT_REPLY_LIMIT = 5;
const DEFAULT_RESULT_LIMIT = 4;
const API_CACHE_CONTROL = 'public, max-age=300, s-maxage=900, stale-while-revalidate=86400';

const RECENT_COMMENTS_QUERY = `
	query RecentDiscussionComments(
		$owner: String!
		$name: String!
		$categoryId: ID!
		$discussionLimit: Int!
		$commentLimit: Int!
		$replyLimit: Int!
	) {
		repository(owner: $owner, name: $name) {
			discussions(
				first: $discussionLimit
				categoryId: $categoryId
				orderBy: { field: UPDATED_AT, direction: DESC }
			) {
				nodes {
					title
					url
					comments(last: $commentLimit) {
						nodes {
							bodyText
							publishedAt
							updatedAt
							url
							author {
								login
								avatarUrl
							}
							replies(last: $replyLimit) {
								nodes {
									bodyText
									publishedAt
									updatedAt
									url
									author {
										login
										avatarUrl
									}
								}
							}
						}
					}
				}
			}
		}
	}
`;

function getString(value) {
	return typeof value === 'string' ? value.trim() : '';
}

function clipText(text, maxLength = 180) {
	const normalized = getString(text).replace(/\s+/g, ' ');
	return normalized.length > maxLength ? `${normalized.slice(0, maxLength)}…` : normalized;
}

function normalizeComment(comment, discussionTitle, discussionUrl, isReply = false) {
	if (!comment) return null;

	const timestamp = comment.publishedAt || comment.updatedAt;
	if (!timestamp) return null;

	return {
		authorAvatarUrl: comment.author?.avatarUrl || '',
		authorLogin: comment.author?.login || 'GitHub 用户',
		bodyText: clipText(comment.bodyText),
		commentUrl: comment.url || discussionUrl,
		discussionTitle,
		discussionUrl,
		isReply,
		publishedAt: timestamp,
	};
}

function extractRecentComments(discussions, resultLimit) {
	const comments = [];

	for (const discussion of discussions || []) {
		const discussionTitle = getString(discussion?.title) || '博客评论';
		const discussionUrl = getString(discussion?.url);
		const discussionComments = discussion?.comments?.nodes || [];

		for (const comment of discussionComments) {
			const normalizedComment = normalizeComment(comment, discussionTitle, discussionUrl, false);
			if (normalizedComment) comments.push(normalizedComment);

			const replies = comment?.replies?.nodes || [];
			for (const reply of replies) {
				const normalizedReply = normalizeComment(reply, discussionTitle, discussionUrl, true);
				if (normalizedReply) comments.push(normalizedReply);
			}
		}
	}

	return comments
		.sort((left, right) => new Date(right.publishedAt).valueOf() - new Date(left.publishedAt).valueOf())
		.slice(0, resultLimit);
}

async function fetchRecentComments({ token, owner, name, categoryId }) {
	const response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
		method: 'POST',
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: RECENT_COMMENTS_QUERY,
			variables: {
				owner,
				name,
				categoryId,
				discussionLimit: DEFAULT_DISCUSSION_LIMIT,
				commentLimit: DEFAULT_COMMENT_LIMIT,
				replyLimit: DEFAULT_REPLY_LIMIT,
			},
		}),
	});

	const rawText = await response.text();
	let payload = null;
	try {
		payload = rawText ? JSON.parse(rawText) : null;
	} catch {
		throw new Error(`GitHub Discussions returned a non-JSON response with status ${response.status}.`);
	}

	if (!response.ok || !payload) {
		throw new Error(`GitHub Discussions request failed with status ${response.status}.`);
	}

	if (Array.isArray(payload.errors) && payload.errors.length > 0) {
		throw new Error(payload.errors[0]?.message || 'GitHub Discussions query returned an error.');
	}

	return payload.data?.repository?.discussions?.nodes || [];
}

export async function onRequest(context) {
	const token = getString(context.env.GITHUB_DISCUSSIONS_TOKEN || context.env.GITHUB_TOKEN);
	const owner = getString(context.env.GISCUS_REPO_OWNER) || DEFAULT_REPO_OWNER;
	const name = getString(context.env.GISCUS_REPO_NAME) || DEFAULT_REPO_NAME;
	const categoryId = getString(context.env.GISCUS_CATEGORY_ID) || DEFAULT_DISCUSSION_CATEGORY_ID;

	if (!token) {
		return Response.json(
			{
				comments: [],
				message: 'Missing GITHUB_DISCUSSIONS_TOKEN. Configure it in Cloudflare Pages to show recent giscus comments.',
			},
			{
				headers: {
					'Cache-Control': API_CACHE_CONTROL,
				},
			},
		);
	}

	try {
		const discussions = await fetchRecentComments({ token, owner, name, categoryId });
		const comments = extractRecentComments(discussions, DEFAULT_RESULT_LIMIT);

		return Response.json(
			{
				comments,
				message:
					comments.length > 0 ? '' : '当前还没有评论，等第一条留言出现后这里就会自动更新。',
			},
			{
				headers: {
					'Cache-Control': API_CACHE_CONTROL,
				},
			},
		);
	} catch (error) {
		console.error('comments api failed', {
			message: error instanceof Error ? error.message : String(error),
			owner,
			name,
			categoryId,
			hasToken: Boolean(token),
		});

		return Response.json(
			{
				comments: [],
				message:
					error instanceof Error
						? error.message
						: 'Failed to load recent comments from GitHub Discussions.',
			},
			{
				status: 502,
				headers: {
					'Cache-Control': API_CACHE_CONTROL,
				},
			},
		);
	}
}
