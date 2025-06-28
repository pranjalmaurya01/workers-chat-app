import { handleWsRequest, WebSocketChatServer } from './ws';

export interface Env {
	WEBSOCKET_CHAT_SERVER: DurableObjectNamespace<WebSocketChatServer>;
}

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
	'Access-Control-Max-Age': '86400',
};

// Worker
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === '/ws/') {
			return handleWsRequest(url, request, env, ctx);
		}
		// else if (request.method === 'GET') {
		// return new Response(null, { status: 200, headers: { ...corsHeaders } });
		// }

		return new Response(null, {
			status: 400,
			statusText: 'Bad Request',
			headers: {
				'Content-Type': 'text/plain',
			},
		});
	},
};

export { WebSocketChatServer };
