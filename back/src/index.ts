import { handleWsRequest, WebSocketChatServer } from './ws';

const defaultHeaders = new Headers({
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
});

// Worker
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === '/ws/') {
			return handleWsRequest(url, request, env, ctx);
		}

		const pathName = url.pathname.substring(1);

		if (request.method === 'POST') {
			switch (pathName) {
				case 'uploadMedia':
					const fd = await request.formData();
					const files = fd.get('file');
					const key = crypto.randomUUID();
					const resp = await env.R2.put(key, files);
					if (resp) {
						const headers = new Headers(defaultHeaders);
						headers.append('Content-Type', 'image/png');
						return new Response(resp.key, { headers });
					}
					return new Response();

				default:
					break;
			}
		}

		if (request.method === 'GET') {
			switch (pathName) {
				case 'getMedia':
					const key = url.searchParams.get('key');
					if (!key) break;
					const resp = await env.R2.get(key);
					if (!resp) break;
					const headers = new Headers(defaultHeaders);
					resp.writeHttpMetadata(headers);
					headers.set('etag', resp.httpEtag);
					headers.append('Cache-Control', `max-age=${1 * 60 * 60}`);
					return new Response(resp.body, { headers });

				default:
					break;
			}
		}

		return new Response(null, {
			status: 200,
			statusText: 'invalid URL',
			headers: defaultHeaders,
		});
	},
};

export { WebSocketChatServer };
