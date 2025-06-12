import { DurableObject } from 'cloudflare:workers';

export interface Env {
	WEBSOCKET_CHAT_SERVER: DurableObjectNamespace<WebSocketChatServer>;
}

// Worker
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.url.endsWith('/ws')) {
			// Expect to receive a WebSocket Upgrade request.
			// If there is one, accept the request and return a WebSocket Response.
			const upgradeHeader = request.headers.get('Upgrade');

			if (!upgradeHeader || upgradeHeader !== 'websocket') {
				return new Response('Durable Object expected Upgrade: websocket', {
					status: 426,
				});
			}

			// This example will refer to the same Durable Object,
			// since the name "foo" is hardcoded.
			let id = env.WEBSOCKET_CHAT_SERVER.idFromName('foo');
			let stub = env.WEBSOCKET_CHAT_SERVER.get(id);

			return stub.fetch(request);
		}

		return new Response(null, {
			status: 400,
			statusText: 'Bad Request',
			headers: {
				'Content-Type': 'text/plain',
			},
		});
	},
};

// Durable Object
export class WebSocketChatServer extends DurableObject {
	sessions: Map<any, any>;
	state: DurableObjectState;
	storage: DurableObjectStorage;
	name: string;

	constructor(state: DurableObjectState, env: unknown) {
		super(state, env);
		this.state = state;
		this.storage = state.storage;
		this.env = env;
		this.name = new Date().toLocaleTimeString();
		this.sessions = new Map();

		this.state.getWebSockets().forEach((webSocket) => {
			// The constructor may have been called when waking up from hibernation,
			// so get previously serialized metadata for any existing WebSockets.
			let meta = webSocket.deserializeAttachment();
			this.sessions.set(webSocket, { ...meta });
		});
	}

	async fetch(request: Request): Promise<Response> {
		// Creates two ends of a WebSocket connection.
		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);

		this.ctx.acceptWebSocket(server);
		const name = new Date().toLocaleTimeString();
		this.sessions.set(server, { name });
		this.send(server, { type: 'name', name });

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	send = (ws: WebSocket, data: any) => {
		ws.send(JSON.stringify(data));
	};

	async webSocketMessage(ws: WebSocket, message: any) {
		message = JSON.parse(message);

		if (message.type) {
			switch (message.type) {
				case 'chat':
					this.broadcast(message, ws);
					break;

				default:
					break;
			}
		}

		// Upon receiving a message from the client, the server replies with the same message,
		// and the total number of connections with the "[Durable Object]: " prefix
		// this.send(ws, { counter: this.value });
	}

	broadcast(message: any, ws?: WebSocket) {
		// Apply JSON if we weren't given a string to start with.
		if (typeof message !== 'string') {
			message = JSON.stringify(message);
		}

		// Iterate over all the sessions sending them messages.
		this.sessions.forEach((session, webSocket) => {
			if (ws !== webSocket) {
				try {
					webSocket.send(message);
				} catch (err) {
					// Whoops, this connection is dead. Remove it from the map and arrange to notify
					// everyone below.
					session.quit = true;
					this.sessions.delete(webSocket);
				}
			}
		});
	}

	async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
		// If the client closes the connection, the runtime will invoke the webSocketClose() handler.
		ws.close(code, 'Durable Object is closing WebSocket');
		this.closeOrErrorHandler(ws);
		console.log('bye');
	}

	async closeOrErrorHandler(ws: WebSocket) {
		let session = this.sessions.get(ws) || {};
		session.quit = true;
		this.sessions.delete(ws);
		// this.broadcast({ type: 'left', members: [...this.sessions.values()] }, ws);
		// if (session.name) {
		// this.broadcast({ quit: session.name });
		// }
	}

	async webSocketError(webSocket: WebSocket, error: any) {
		this.closeOrErrorHandler(webSocket);
	}
}
