import { DurableObject } from 'cloudflare:workers';
import { v7 as uuidv7 } from 'uuid';

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
					// if at the same time 2 messages arrive, only one will be saved
					const storeMsg = { key: m.timestamp.toString(), value: JSON.stringify(m) };
					await this.storage.put(storeMsg.key, storeMsg.value);
					break;
				case 'ack':
					const senderWs = this.state.getWebSockets().find((t) => {
						if (t.readyState === 1) {
							const userId = t.deserializeAttachment().id;
							return userId === m.senderId;
						}
					});
					const receiver = ws.deserializeAttachment().userName;
					if (senderWs) {
						senderWs.send(JSON.stringify({ type: 'ack', msgId: m.msgId, deliveredTo: receiver }));
					}
					let msg = (await this.storage.get(m.msgTimestamp)) as any | undefined;
					if (msg) {
						msg = JSON.parse(msg);
						msg.deliveredTo.push(receiver);
						this.storage.put(m.msgTimestamp, JSON.stringify(msg));
					}
					break;

				case 'userName':
					const { userName, userId } = m;
					const userD = { userName: userName, id: userId ? userId : uuidv7() };

					ws.serializeAttachment({ ...ws.deserializeAttachment, ...userD });
					ws.send(JSON.stringify({ type: 'user', ...userD }));
					this.sendOnlineUsers();
					const msgHistory = await this.storage.list({ limit: 50 });
					const d: any = [...msgHistory.values()].map((e: any) => JSON.parse(e));
					ws.send(JSON.stringify({ type: 'msgHistory', msgs: d }));
					// await this.storage.deleteAll();
					break;
				default:
					break;
			}
		}
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
		ws.close(code, 'Durable Object is closing WebSocket');
		this.closeOrErrorHandler(ws);
	}

	async webSocketError(webSocket: WebSocket, error: any) {
		this.closeOrErrorHandler(webSocket);
	}
}

export function handleWsRequest(url: URL, request: Request, env: Env, ctx: ExecutionContext) {
	const room = url.searchParams.get('room');
	if (!room) {
		return new Response('invalid', {
			status: 401,
		});
	}

	const upgradeHeader = request.headers.get('Upgrade');
	if (!upgradeHeader || upgradeHeader !== 'websocket') {
		return new Response('Durable Object expected Upgrade: websocket', {
			status: 426,
		});
	}
	let id = env.WEBSOCKET_CHAT_SERVER.idFromName(room);
	let stub = env.WEBSOCKET_CHAT_SERVER.get(id);
	return stub.fetch(request);
}
