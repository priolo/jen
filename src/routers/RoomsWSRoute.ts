import ChatNode from "@/services/rooms/ChatWs.js"
import { Bus, typeorm, ws } from "@priolo/julian"
import { randomUUID } from "crypto"
import { AgentRepo } from "../repository/Agent.js"
import { RoomRepo } from "../repository/Room.js"
import { ToolRepo } from "../repository/Tool.js"
import { Response } from '../services/agents/types.js'
import { BaseC2S, CHAT_ACTION_C2S, UserEnterC2S, UserLeaveC2S, UserMessageC2S } from "../types/RoomActions.js"



export type WSRoomsConf = Partial<WSRoomsService['stateDefault']>

/**
 * WebSocket service for managing prompt chat rooms
 */
export class WSRoomsService extends ws.route {

	private chats: ChatNode[] = []

	get stateDefault() {
		return {
			...super.stateDefault,
			name: "ws-rooms",
			repository: "/typeorm/rooms",
			agentRepository: "/typeorm/agents",
			toolRepository: "/typeorm/tools",
		}
	}

	private getClient(clientId: string): ws.IClient | undefined {
		const clients = this.getClients()
		return clients.find(c => c.remoteAddress === clientId)
	}


	async onConnect(client: ws.IClient) {
		// qua posso mettere tutti i dati utili al client
		console.log(`Client connected: ${client.remoteAddress}`)
		super.onConnect(client)
	}

	/**
	 * Handle client disconnection
	 */
	onDisconnect(client: ws.IClient) {
		// rimuovo il client da tutte le CHATs
		const chats = [...this.chats]
		for (const chat of chats) {
			this.handleLeave(
				client,
				{ action: CHAT_ACTION_C2S.LEAVE, chatId: chat.id } as UserLeaveC2S
			)
		}
		super.onDisconnect(client)
	}

	/**
	 * Handle incoming WebSocket messages
	 */
	async onMessage(client: ws.IClient, message: string) {
		if (!client || !message) return
		const msg = JSON.parse(message) as BaseC2S

		switch (msg.action) {
			case CHAT_ACTION_C2S.ENTER:
				await this.handleEnter(client, msg as UserEnterC2S)
				break
			case CHAT_ACTION_C2S.LEAVE:
				await this.handleLeave(client, msg as UserLeaveC2S)
				break
			case CHAT_ACTION_C2S.USER_MESSAGE:
				await this.handleUserMessage(client, msg as UserMessageC2S)
				break
			default:
				console.warn(`Unknown action: ${msg.action}`)
				return
		}

		console.log(`WSPromptService.onMessage`, msg)
	}

	/**
	 * Handle client entering in a chat
	 */
	private async handleEnter(client: ws.IClient, msg: UserEnterC2S) {
		const chat = new ChatNode(this)
		this.chats.push(chat)
		chat.enterClient(client.remoteAddress, msg.agentId)

		// // se non c'e' l'id allora creo una CHAT nuova
		// if (!msg.chatId) {
		// 	chat = await createNewChat(msg.agentId)
		// 	this.chats.push(chat)
		// 	// altrimenti cerco l'istanza della CHAT
		// } else {
		// 	chat = this.getChatById(msg.chatId)
		// 	// se la CHAT non c'e la carico dal DB e la inserisco
		// 	if (!chat) {
		// 		chat = await this.loadChat(msg.chatId)
		// 	}
		// }
		// aggiungo il client alla room
		//chat.clients.add(client.remoteAddress)

		// // creo e invio il messaggio di entrata
		// const message: UserEnteredS2C = {
		// 	action: CHAT_ACTION_S2C.ENTERED,
		// 	chatId: chat.id,
		// 	roomId: chat.getRootRoomId(),
		// 	//agentId: getRootRoom(chat)?.agentId,
		// }
		// this.sendToChat(message)
	}

	private async handleLeave(client: ws.IClient, msg: UserLeaveC2S) {
		const chat = this.getChatById(msg.chatId)
		if (!chat) return this.log(`Chat not found: ${msg.chatId}`)

		chat.removeClient(client.remoteAddress)

		// const message: BaseS2C = {
		// 	action: CHAT_ACTION_S2C.LEAVE,
		// 	chatId: msg.chatId,
		// }
		// this.sendToChat(message)
		this.log(`Client ${client.remoteAddress} left chat ${msg.chatId}`)
	}

	private async handleUserMessage(client: ws.IClient, msg: UserMessageC2S) {
		const chat = this.getChatById(msg.chatId)
		if (!chat) return this.log(`Chat not found: ${msg.chatId}`)

		chat.userMessage(client.remoteAddress, msg.text)
		// if (!!msg.complete) {
		// 	this.complete(chat, msg.text)
		// } else {
		// 	const item: CoreUserMessage = {
		// 		role: "user",
		// 		content: msg.text,
		// 	}
		// 	const rootRoom = getRootRoom(chat)
		// 	rootRoom.history.push(item)
		// const msgToClient: AppendMessageS2C = {
		// 	action: CHAT_ACTION_S2C.APPEND_MESSAGE,
		// 	chatId: chat.id,
		// 	roomId: rootRoom.id,
		// 	content: [item],
		// }
		// this.sendToChat(msgToClient)
		//}
	}





	//#region  OVERWRITE

	public async createRoom(agents?: AgentRepo[], parentId?: string): Promise<RoomRepo | null> {
		// per il momento non salvo in DB
		// const room: RoomRepo = await new Bus(this, this.state.repository).dispatch({
		// 	type: typeorm.RepoRestActions.SAVE,
		// 	payload: {
		// 		history: [],
		// 		agents: [],
		// 	}
		// })
		return {
			id: randomUUID() as string,
			parentRoomId: parentId,
			history: [],
			agents: agents,
		}
	}

	// public async getRoomById(roomId: string): Promise<RoomRepo> {
	// 	const room: RoomRepo = await new Bus(this, this.state.repository).dispatch({
	// 		type: typeorm.RepoRestActions.GET_BY_ID,
	// 		payload: roomId
	// 	})
	// 	return room
	// }

	public async getAgentRepoById(agentId: string): Promise<AgentRepo> {
		const agent: AgentRepo = await new Bus(this, this.state.agentRepository).dispatch({
			type: typeorm.RepoRestActions.GET_BY_ID,
			payload: agentId
		})
		return agent
	}

	//[TO DO]
	public async executeTool(toolId: string, args: any): Promise<any> {
		const toolRepo: ToolRepo = await new Bus(this, this.state.toolRepository).dispatch({
			type: typeorm.RepoRestActions.GET_BY_ID,
			payload: toolId
		})
		if (!toolRepo) return null;

		return "42"
	}

	//[TO DO]
	public agentMessage(roomId: string, agentId: string, response: Response): void {
		//INVIA IL MESSAGGIO AL CLIENT;
		console.log(`Agent ${agentId} in room ${roomId} responded:`, response)

		// invia messaggio al CLIENT
		// const msg: AppendMessageS2C = {
		// 	action: CHAT_ACTION_S2C.APPEND_MESSAGE,
		// 	chatId: chat.id,
		// 	roomId: room.id,
		// 	content: messages,
		// }
		// this.sendToChat(msg)

	}

	/**
	 * Quando un CLIENT lascia la chat se è vuota la rimuove
	 */
	public removeChat(chatId: string): void {
		const index = this.chats.findIndex(c => c.id === chatId)
		if (index !== -1) {
			this.chats.splice(index, 1)
			this.log(`Chat removed: ${chatId}`)
		} else {
			this.log(`Chat not found: ${chatId}`)
		}
	}



	//#endregion OVERWRITE







	public sendMessageToClient(clientAddress: string, message: string) {
		const client = this.getClient(clientAddress)
		if (!client) return
		this.sendToClient(client, JSON.stringify(message))
	}

	private getChatById(chatId: string): ChatNode | undefined {
		return this.chats.find(c => c.id === chatId)
	}










	// private async complete(chat: Chat, prompt: string): Promise<void> {
	// 	const rootRoom = getRootRoom(chat)
	// 	const agentId = rootRoom.agentId
	// 	const resolver: Resolver = {
	// 		getAgent: async (id: string) => {
	// 			const agent: AgentRepo = await new Bus(this, "/typeorm/agents").dispatch({
	// 				type: typeorm.Actions.FIND_ONE,
	// 				payload: {
	// 					where: { id },
	// 					relations: ["tools", "subAgents"],
	// 					select: {
	// 						subAgents: { id: true },
	// 						tools: { id: true }
	// 					}
	// 				}
	// 			})
	// 			return agent
	// 		},
	// 		getTools: async (id: string) => {
	// 			const tool: ToolRepo = await new Bus(this, "/typeorm/tools").dispatch({
	// 				type: typeorm.RepoRestActions.GET_BY_ID,
	// 				payload: id
	// 			})
	// 			return tool
	// 		},
	// 		onCreateNewRoom: (agentId: string, parentRoomId: string): string => {
	// 			// creo una nuova room
	// 			const newRoom = {
	// 				id: randomUUID() as string,
	// 				name: "",
	// 				history: [],
	// 				agentId,
	// 				parentRoomId,
	// 			}
	// 			chat.rooms.push(newRoom)

	// 			// [II] salvataggio nel DB

	// 			// invia messaggio al CLIENT
	// 			const msg: NewRoomS2C = {
	// 				action: CHAT_ACTION_S2C.NEW_ROOM,
	// 				chatId: chat.id,
	// 				roomId: newRoom.id,
	// 				parentRoomId,
	// 				agentId,
	// 			}
	// 			this.sendToChat(msg)

	// 			return newRoom.id
	// 		},
	// 		// quando l'agente invia un messaggio	
	// 		onMessage: (agentId: string, messages?: ChatMessage[], roomId?: string): ChatMessage[] => {
	// 			const room = getRoomById(chat, roomId)
	// 			if (!messages || !messages.length) {
	// 				return room.history
	// 			}
	// 			room.history.push(...messages)

	// 			// [TODO] salvataggio nel DB

	// 			// invia messaggio al CLIENT
	// 			const msg: AppendMessageS2C = {
	// 				action: CHAT_ACTION_S2C.APPEND_MESSAGE,
	// 				chatId: chat.id,
	// 				roomId: room.id,
	// 				content: messages,
	// 			}
	// 			this.sendToChat(msg)

	// 			return room.history
	// 		},
	// 	}
	// 	const agent = new AgentLlm({ id: agentId }, resolver)
	// 	agent.roomId = rootRoom.id // setto l'id della room nell'agente
	// 	// creo l'istanza dell'agente
	// 	const response = await agent.ask(prompt)
	// }

	/**
	 * Send a message to all clients in a chat
	 */
	// private sendToChat(message: BaseS2C) {
	// 	if (!message || !message.chatId) return this.log("missing roomId in message")
	// 	const chat = this.chats.find(c => c.id == message.chatId)
	// 	if (!chat) return this.log(`CHAT not found: ${message.chatId}`)

	// 	for (const clientAddress of chat.clients) {
	// 		const client = this.getClient(clientAddress)
	// 		if (!client) continue
	// 		this.sendToClient(client, JSON.stringify(message))
	// 	}
	// }
}

// export interface Chat {
// 	id: string
// 	rooms: RoomRepo[]
// 	clients: Set<string>
// }


// async function createNewChat(agentId: string): Promise<Chat> {
// 	const room: RoomRepo = {
// 		id: randomUUID() as string,
// 		history: [],
// 		agentId,
// 	}
// 	const chat: Chat = {
// 		id: randomUUID(),
// 		rooms: [room],
// 		clients: new Set(),
// 	}
// 	return chat
// }


// async function recursiveAsk(room: RoomRepo): Promise<Response> {

// 	const room = new RoomTurnBased(room)


// 	room.onTurnStarted(async (agent: AgentLlm) => { });
// 	room.onTurn(async (agent: AgentLlm) => {
// 		return agent.ask(room.history)
// 	});
// 	room.onTurnFinished(async (agent: AgentLlm, response: Response) => { });

// 	room.onAskTo(async (agent: AgentRepo, content: ContentAskTo) => {
// 		const subRoomRepo = {
// 			history: [],
// 			agents: [agent],
// 		}
// 		await recursiveAsk(subRoomRepo)
// 	});

// }


// function getRoomById(chat: Chat, roomId?: string): RoomRepo {
// 	return chat?.rooms?.find(r => r.id == roomId)
// }
// function getRootRoom(chat: Chat): RoomRepo {
// 	return chat?.rooms?.find(r => r.parentRoomId == null)
// }