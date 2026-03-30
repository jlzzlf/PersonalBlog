const STATE_COOKIE = 'cms_oauth_state';
const DEFAULT_AUTH_SCOPE = 'repo';

function getString(value) {
	return typeof value === 'string' ? value.trim() : '';
}

function createCookie(name, value, requestUrl, overrides = '') {
	const secure = requestUrl.protocol === 'https:' ? '; Secure' : '';
	return `${name}=${value}; HttpOnly; Path=/api/cms; SameSite=Lax${secure}${overrides}`;
}

function renderHtml(body) {
	return new Response(body, {
		headers: {
			'Cache-Control': 'no-store',
			'Content-Type': 'text/html; charset=utf-8',
		},
	});
}

function renderErrorPage(message) {
	return renderHtml(`<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>CMS Auth Error</title>
	</head>
	<body>
		<p>${message}</p>
	</body>
</html>`);
}

export async function onRequestGet(context) {
	const requestUrl = new URL(context.request.url);
	const provider = getString(requestUrl.searchParams.get('provider'));
	const requestedScope = getString(requestUrl.searchParams.get('scope'));
	const scope = requestedScope === 'public_repo' || requestedScope === 'repo'
		? requestedScope
		: getString(context.env.CMS_GITHUB_AUTH_SCOPE) || DEFAULT_AUTH_SCOPE;
	const clientId = getString(context.env.GITHUB_OAUTH_CLIENT_ID);

	if (provider !== 'github') {
		return renderErrorPage('Only the GitHub backend is supported by this CMS setup.');
	}

	if (!clientId) {
		return renderErrorPage('Missing GITHUB_OAUTH_CLIENT_ID in Cloudflare Pages environment variables.');
	}

	const state = crypto.randomUUID();
	const redirectUrl = new URL('https://github.com/login/oauth/authorize');
	redirectUrl.searchParams.set('client_id', clientId);
	redirectUrl.searchParams.set('redirect_uri', `${requestUrl.origin}/api/cms/callback`);
	redirectUrl.searchParams.set('scope', scope);
	redirectUrl.searchParams.set('state', state);
	redirectUrl.searchParams.set('allow_signup', 'false');

	const response = renderHtml(`<!doctype html>
<html lang="zh-Hant">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>正在跳转 GitHub</title>
	</head>
	<body>
		<p>正在跳转到 GitHub 登录。</p>
		<script>
			const authorizeUrl = ${JSON.stringify(redirectUrl.toString())};

			function beginAuth(event) {
				if (event.origin !== window.location.origin) return;
				if (event.data !== 'authorizing:github') return;
				window.removeEventListener('message', beginAuth, false);
				window.location.replace(authorizeUrl);
			}

			window.addEventListener('message', beginAuth, false);

			if (window.opener) {
				window.opener.postMessage('authorizing:github', window.location.origin);
			} else {
				document.body.innerHTML = '<p>请从博客后台弹窗中打开此页面。</p>';
			}
		</script>
	</body>
</html>`);

	response.headers.set(
		'Set-Cookie',
		createCookie(STATE_COOKIE, state, requestUrl, '; Max-Age=600'),
	);

	return response;
}
