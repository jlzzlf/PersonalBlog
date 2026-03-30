const REALM = 'Personal Blog CMS';

function getString(value) {
	return typeof value === 'string' ? value.trim() : '';
}

function shouldProtect(pathname) {
	return pathname === '/admin'
		|| pathname.startsWith('/admin/')
		|| pathname === '/api/cms'
		|| pathname.startsWith('/api/cms/');
}

function parseBasicAuth(header) {
	const value = getString(header);
	if (!value.startsWith('Basic ')) return null;

	try {
		const decoded = atob(value.slice(6));
		const separator = decoded.indexOf(':');
		if (separator === -1) return null;

		return {
			username: decoded.slice(0, separator),
			password: decoded.slice(separator + 1),
		};
	} catch {
		return null;
	}
}

function safeEqual(left, right) {
	if (left.length !== right.length) return false;

	let mismatch = 0;
	for (let index = 0; index < left.length; index += 1) {
		mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
	}

	return mismatch === 0;
}

function challenge(message) {
	return new Response(message, {
		status: 401,
		headers: {
			'Cache-Control': 'no-store',
			'Content-Type': 'text/plain; charset=utf-8',
			'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
		},
	});
}

export async function onRequest(context) {
	const requestUrl = new URL(context.request.url);

	if (!shouldProtect(requestUrl.pathname)) {
		return context.next();
	}

	const expectedUsername = getString(context.env.CMS_ADMIN_USERNAME);
	const expectedPassword = getString(context.env.CMS_ADMIN_PASSWORD);

	if (!expectedUsername || !expectedPassword) {
		return new Response(
			'Missing CMS_ADMIN_USERNAME or CMS_ADMIN_PASSWORD in Cloudflare Pages environment variables.',
			{
				status: 500,
				headers: {
					'Cache-Control': 'no-store',
					'Content-Type': 'text/plain; charset=utf-8',
				},
			},
		);
	}

	const credentials = parseBasicAuth(context.request.headers.get('Authorization'));

	if (
		!credentials
		|| !safeEqual(credentials.username, expectedUsername)
		|| !safeEqual(credentials.password, expectedPassword)
	) {
		return challenge('This page is protected. Enter your CMS username and password.');
	}

	const response = await context.next();

	if (requestUrl.pathname === '/admin' || requestUrl.pathname.startsWith('/admin/')) {
		response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
	}

	return response;
}
