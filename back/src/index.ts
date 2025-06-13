import { DurableObject } from 'cloudflare:workers';
import { v7 as uuidv7 } from 'uuid';

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
	state: DurableObjectState;
	storage: DurableObjectStorage;
	sessions: {};

	constructor(state: DurableObjectState, env: unknown) {
		super(state, env);
		this.state = state;
		this.storage = state.storage;
		this.env = env;
		this.sessions = {};
	}

	async fetch(request: Request): Promise<Response> {
		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);

		this.ctx.acceptWebSocket(server);

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	send = (data: any) => {
		this.send(JSON.stringify(data));
	};

	async webSocketMessage(ws: WebSocket, m: any) {
		m = JSON.parse(m);

		if (m.type) {
			switch (m.type) {
				case 'chat':
					this.broadcast(m, ws);
					break;
				case 'delivered':
					const senderWs = this.state.getWebSockets().find((t) => {
						if (t.readyState === 1) {
							const userId = t.deserializeAttachment().id;
							return userId === m.senderId;
						}
					});
					if (senderWs) {
						senderWs.send(JSON.stringify({ type: 'ack', msgId: m.msgId, deliveredTo: ws.deserializeAttachment().userName }));
					}
					// const deliveredToUser = this.sessions.get(ws);
					// for (let [key, value] of this.sessions.entries()) {
					// 	if (value.name === m.sender) {
					// 		key.send();
					// 		break;
					// 	}
					// }
					// console.log(sender);
					break;

				case 'userName':
					const { userName, userId } = m;
					const userD = { userName: userName, id: userId ? userId : uuidv7() };

					ws.serializeAttachment({ ...ws.deserializeAttachment, ...userD });
					ws.send(JSON.stringify({ type: 'user', ...userD }));
					this.sendOnlineUsers();
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
		this.state.getWebSockets().forEach((webSocket) => {
			if (ws !== webSocket) {
				try {
					webSocket.send(message);
				} catch (err) {
					// console.error('this socket is dead', webSocket.deserializeAttachment());
					webSocket.close();
				}
			}
		});
	}

	sendOnlineUsers() {
		const onlineUsers = this.state
			.getWebSockets()
			.map((e) => e.readyState === 1 && e.deserializeAttachment())
			.filter((e) => e);
		this.broadcast({ type: 'online', users: onlineUsers });
	}

	async closeOrErrorHandler(ws: WebSocket) {
		this.sendOnlineUsers();
	}

	async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
		// If the client closes the connection, the runtime will invoke the webSocketClose() handler.
		ws.close(code, 'Durable Object is closing WebSocket');
		this.closeOrErrorHandler(ws);
	}

	async webSocketError(webSocket: WebSocket, error: any) {
		this.closeOrErrorHandler(webSocket);
	}
}
