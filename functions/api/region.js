function normalizeCountry(value) {
	return typeof value === 'string' ? value.trim().toUpperCase() : '';
}

export async function onRequest(context) {
	const country = normalizeCountry(
		context.request.cf?.country ?? context.request.headers.get('cf-ipcountry'),
	);
	const isMainlandChina = country === 'CN';

	return new Response(
		JSON.stringify({
			country,
			isMainlandChina,
		}),
		{
			headers: {
				'Cache-Control': 'no-store',
				'Content-Type': 'application/json; charset=utf-8',
			},
		},
	);
}
