const DEFAULT_GALLERY_PREFIX = 'picture/';
const DEFAULT_GALLERY_PUBLIC_BASE_URL = 'https://cdn.joylife-zhang.site';
const API_CACHE_CONTROL = 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400';

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

function createImageLabel(key, prefix) {
	const normalizedKey = prefix && key.startsWith(prefix) ? key.slice(prefix.length) : key;
	const fileName = normalizedKey.split('/').pop() || normalizedKey;

	try {
		return decodeURIComponent(fileName).replace(/\.[^.]+$/i, '');
	} catch {
		return fileName.replace(/\.[^.]+$/i, '');
	}
}

function createImageAlt(label) {
	return `${label} 图片`;
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
	const bucket = context.env.GALLERY_BUCKET || context.env.MUSIC_BUCKET;
	if (!bucket || typeof bucket.list !== 'function') {
		return Response.json(
			{
				message: 'Missing GALLERY_BUCKET binding. You can also reuse MUSIC_BUCKET for gallery listing.',
				images: [],
			},
			{
				status: 500,
				headers: {
					'Cache-Control': API_CACHE_CONTROL,
				},
			},
		);
	}

	const prefix = normalizePrefix(context.env.GALLERY_OBJECT_PREFIX || DEFAULT_GALLERY_PREFIX);
	const publicBaseUrl = getString(
		context.env.GALLERY_PUBLIC_BASE_URL || DEFAULT_GALLERY_PUBLIC_BASE_URL,
	).replace(/\/+$/, '');

	try {
		const objects = await listAllObjects(bucket, prefix);
		const images = objects
			.filter((object) => /\.(avif|gif|jpe?g|png|webp)$/i.test(object.key))
			.sort((left, right) =>
				createImageLabel(left.key, prefix).localeCompare(createImageLabel(right.key, prefix), 'zh-CN', {
					numeric: true,
					sensitivity: 'base',
				}),
			)
			.map((object) => {
				const label = createImageLabel(object.key, prefix);

				return {
					key: object.key,
					label,
					alt: createImageAlt(label),
					src: `${publicBaseUrl}/${encodeObjectKeyForUrl(object.key)}`,
				};
			});

		return Response.json(
			{ images },
			{
				headers: {
					'Cache-Control': API_CACHE_CONTROL,
				},
			},
		);
	} catch {
		return Response.json(
			{
				message: 'Failed to list gallery files from R2.',
				images: [],
			},
			{
				status: 500,
				headers: {
					'Cache-Control': API_CACHE_CONTROL,
				},
			},
		);
	}
}

