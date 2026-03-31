const DEFAULT_MUSIC_PREFIX = 'music/';
const DEFAULT_MUSIC_PUBLIC_BASE_URL = 'https://cdn.joylife-zhang.site';

function getString(value) {
	return typeof value === 'string' ? value.trim() : '';
}

function normalizePrefix(prefix) {
	const normalized = getString(prefix).replace(/^\/+|\/+$/g, '');
	return normalized ? `${normalized}/` : '';
}

function encodeObjectKeyForUrl(key) {
	return key
		.split('/')
		.filter(Boolean)
		.map((part) => encodeURIComponent(part))
		.join('/');
}

function createTrackLabel(key, prefix) {
	const normalizedKey = prefix && key.startsWith(prefix) ? key.slice(prefix.length) : key;
	const fileName = normalizedKey.split('/').pop() || normalizedKey;

	try {
		return decodeURIComponent(fileName).replace(/\.mp3$/i, '');
	} catch {
		return fileName.replace(/\.mp3$/i, '');
	}
}

async function listAllObjects(bucket, prefix) {
	const objects = [];
	let cursor;

	do {
		const result = await bucket.list({
			cursor,
			prefix,
			limit: 1000,
		});

		objects.push(...result.objects);
		cursor = result.truncated ? result.cursor : undefined;
	} while (cursor);

	return objects;
}

export async function onRequest(context) {
	const bucket = context.env.MUSIC_BUCKET;
	if (!bucket || typeof bucket.list !== 'function') {
		return Response.json(
			{
				message: 'Missing MUSIC_BUCKET binding to the blog-video bucket in Cloudflare Pages.',
				tracks: [],
			},
			{
				status: 500,
				headers: {
					'Cache-Control': 'no-store',
				},
			},
		);
	}

	const prefix = normalizePrefix(context.env.MUSIC_OBJECT_PREFIX || DEFAULT_MUSIC_PREFIX);
	const publicBaseUrl = getString(context.env.MUSIC_PUBLIC_BASE_URL || DEFAULT_MUSIC_PUBLIC_BASE_URL).replace(
		/\/+$/,
		'',
	);

	try {
		const objects = await listAllObjects(bucket, prefix);
		const tracks = objects
			.filter((object) => /\.mp3$/i.test(object.key))
			.sort((left, right) =>
				createTrackLabel(left.key, prefix).localeCompare(createTrackLabel(right.key, prefix), 'zh-CN', {
					numeric: true,
					sensitivity: 'base',
				}),
			)
			.map((object) => ({
				key: object.key,
				label: createTrackLabel(object.key, prefix),
				src: `${publicBaseUrl}/${encodeObjectKeyForUrl(object.key)}`,
			}));

		return Response.json(
			{ tracks },
			{
				headers: {
					'Cache-Control': 'no-store',
				},
			},
		);
	} catch {
		return Response.json(
			{
				message: 'Failed to list music files from R2.',
				tracks: [],
			},
			{
				status: 500,
				headers: {
					'Cache-Control': 'no-store',
				},
			},
		);
	}
}
