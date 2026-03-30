const GITHUB_TOKEN_ENDPOINT = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_ENDPOINT = 'https://api.github.com/user';
const STATE_COOKIE = 'cms_oauth_state';

function getString(value) {
	return typeof value === 'string' ? value.trim() : '';
}

function parseCookies(cookieHeader) {
	return Object.fromEntries(
		getString(cookieHeader)
			.split(';')
			.map((part) => part.trim())
			.filter(Boolean)
			.map((part) => {
				const separator = part.indexOf('=');
				if (separator === -1) return [part, ''];
				return [part.slice(0, separator), decodeURIComponent(part.slice(separator + 1))];
			}),
	);
}

function createClearCookie(requestUrl) {
	const secure = requestUrl.protocol === 'https:' ? '; Secure' : '';
	return `${STATE_COOKIE}=; HttpOnly; Path=/api/cms; SameSite=Lax${secure}; Max-Age=0`;
}

function escapeHtml(value) {
	return String(value)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function renderPopupMessage({ type, payload, requestUrl, status = 200 }) {
	const message = `authorization:github:${type}:${JSON.stringify(payload)}`;
	return new Response(`<!doctype html>
<html lang="zh-Hant">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>博客后台授权</title>
	</head>
	<body>
		<p>${escapeHtml(type === 'success' ? '授权成功，正在返回后台。' : payload.message)}</p>
		<script>
			const message = ${JSON.stringify(message)};
			if (window.opener) {
				window.opener.postMessage(message, window.location.origin);
				window.close();
			}
		</script>
	</body>
</html>`, {
		status,
		headers: {
			'Cache-Control': 'no-store',
			'Content-Type': 'text/html; charset=utf-8',
			'Set-Cookie': createClearCookie(requestUrl),
		},
	});
}

function errorResponse(message, requestUrl, status = 400) {
	return renderPopupMessage({
		type: 'error',
		payload: { message },
		requestUrl,
		status,
	});
}

async function exchangeCodeForToken({ code, state, clientId, clientSecret, redirectUri }) {
	const response = await fetch(GITHUB_TOKEN_ENDPOINT, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			client_id: clientId,
			client_secret: clientSecret,
			code,
			state,
			redirect_uri: redirectUri,
		}),
	});

	const payload = await response.json();
	if (!response.ok || !payload.access_token) {
		throw new Error(payload.error_description || payload.error || 'GitHub token exchange failed.');
	}

	return payload;
}

async function fetchGitHubUser(accessToken) {
	const response = await fetch(GITHUB_USER_ENDPOINT, {
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${accessToken}`,
			'User-Agent': 'Astro-Decap-CMS',
		},
	});

	if (!response.ok) {
		throw new Error('Unable to read the authenticated GitHub user profile.');
	}

	return response.json();
}

export async function onRequestGet(context) {
	const requestUrl = new URL(context.request.url);
	const code = getString(requestUrl.searchParams.get('code'));
	const state = getString(requestUrl.searchParams.get('state'));
	const oauthError = getString(requestUrl.searchParams.get('error'));
	const oauthErrorDescription = getString(requestUrl.searchParams.get('error_description'));
	const clientId = getString(context.env.GITHUB_OAUTH_CLIENT_ID);
	const clientSecret = getString(context.env.GITHUB_OAUTH_CLIENT_SECRET);
	const allowedLogins = getString(context.env.CMS_ALLOWED_GITHUB_LOGINS)
		.split(',')
		.map((login) => login.trim().toLowerCase())
		.filter(Boolean);

	if (oauthError) {
		return errorResponse(
			oauthErrorDescription || oauthError || 'GitHub OAuth authorization failed.',
			requestUrl,
		);
	}

	if (!code || !state) {
		return errorResponse('GitHub OAuth callback is missing the code or state parameter.', requestUrl);
	}

	if (!clientId || !clientSecret) {
		return errorResponse(
			'Missing GITHUB_OAUTH_CLIENT_ID or GITHUB_OAUTH_CLIENT_SECRET in Cloudflare Pages environment variables.',
			requestUrl,
			500,
		);
	}

	const cookies = parseCookies(context.request.headers.get('Cookie'));
	if (!cookies[STATE_COOKIE] || cookies[STATE_COOKIE] !== state) {
		return errorResponse('GitHub OAuth state validation failed. Please try logging in again.', requestUrl);
	}

	try {
		const tokenPayload = await exchangeCodeForToken({
			code,
			state,
			clientId,
			clientSecret,
			redirectUri: `${requestUrl.origin}/api/cms/callback`,
		});

		if (allowedLogins.length > 0) {
			const user = await fetchGitHubUser(tokenPayload.access_token);
			const login = getString(user.login).toLowerCase();

			if (!allowedLogins.includes(login)) {
				return errorResponse(
					`GitHub 用户 ${user.login} 不在允许登录的白名单中。`,
					requestUrl,
					403,
				);
			}
		}

		return renderPopupMessage({
			type: 'success',
			payload: {
				token: tokenPayload.access_token,
				provider: 'github',
			},
			requestUrl,
		});
	} catch (error) {
		return errorResponse(
			error instanceof Error ? error.message : 'GitHub OAuth callback failed.',
			requestUrl,
			500,
		);
	}
}
