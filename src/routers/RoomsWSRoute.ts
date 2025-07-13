import { Bus, typeorm, ws } from "@priolo/julian"
import AgentExe, { Resolver } from "../agents/llm/AgentExe.js"
import { Agent } from "../repository/Agent.js"
import { Room } from "../repository/Room.js"
import { Tool } from "../repository/Tool.js"
import { AppendMessageS2C, BaseC2S, BaseS2C, CHAT_ACTION_C2S, CHAT_ACTION_S2C, NewRoomS2C, UserEnterC2S, UserEnteredS2C, UserLeaveC2S, UserLeaveS2C, UserMessageC2S } from "../types/RoomActions.js"
import { CoreMessage, CoreUserMessage } from "ai"
import { randomUUID } from "crypto"



export type WSRoomsConf = Partial<WSRoomsService['stateDefault']>

/**
 * WebSocket service for managing prompt chat rooms
 */
export class WSRoomsService extends ws.route {

	private chats: Chat[] = []

	get stateDefault() {
		return {
			...super.stateDefault,
			name: "ws-rooms",
			repository: "/typeorm/rooms",
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
	 * Handle client entering a room
	 */
	private async handleEnter(client: ws.IClient, msg: UserEnterC2S) {
		let chat: Chat

		// se non c'e' l'id allora creo una CHAT nuova
		if (!msg.chatId) {
			chat = await createNewChat(msg.agentId )
			this.chats.push(chat)
			// altrimenti cerco l'istanza della CHAT
		} else {
			chat = this.getChatById(msg.chatId)
			// se la CHAT non c'e la carico dal DB e la inserisco
			if (!chat) {
				chat = await this.loadChat(msg.chatId)
			}
		}

		// aggiungo il client alla room
		chat.clients.add(client.remoteAddress)

		// creo e invio il messaggio di entrata
		const message: UserEnteredS2C = {
			action: CHAT_ACTION_S2C.ENTERED,
			chatId: chat.id,
			roomId: getRootRoom(chat).id,
			agentId: getRootRoom(chat)?.agentId,
		}
		this.sendToChat(message)
	}

	private async handleLeave(client: ws.IClient, msg: UserLeaveC2S) {
		const chat = this.getChatById(msg.chatId)
		if (!chat) {
			this.log(`Chat not found: ${msg.chatId}`)
			return
		}

		// rimuovo il client dalla room
		chat.clients.delete(client.remoteAddress)

		// se non ci sono piu' client nella CHAT la elimino
		if (chat.clients.size === 0) {
			this.chats = this.chats.filter(r => r !== chat)
		}

		const message: BaseS2C = {
			action: CHAT_ACTION_S2C.LEAVE,
			chatId: msg.chatId,
		}
		this.sendToChat(message)
		this.log(`Client ${client.remoteAddress} left chat ${msg.chatId}`)
	}

	private async handleUserMessage(client: ws.IClient, msg: UserMessageC2S) {
		const chat = this.getChatById(msg.chatId)
		if (!!msg.complete) {
			this.complete(chat, msg.text)
		} else {
			const item: CoreUserMessage = {
				role: "user",
				content: msg.text,
			}
			const rootRoom = getRootRoom(chat)
			rootRoom.history.push(item)
			const msgToClient: AppendMessageS2C = {
				action: CHAT_ACTION_S2C.APPEND_MESSAGE,
				chatId: chat.id,
				roomId: rootRoom.id,
				content: [item],
			}
			this.sendToChat(msgToClient)
		}
	}

	private async complete(chat: Chat, prompt: string): Promise<void> {
		const rootRoom = getRootRoom(chat)
		const agentId = rootRoom.agentId
		const resolver: Resolver = {
			getAgent: async (id: string) => {
				const agent: Agent = await new Bus(this, "/typeorm/agents").dispatch({
					type: typeorm.Actions.FIND_ONE,
					payload: {
						where: { id },
						relations: ["tools", "subAgents"],
						select: {
							subAgents: { id: true },
							tools: { id: true }
						}
					}
				})
				return agent
			},
			getTools: async (id: string) => {
				const tool: Tool = await new Bus(this, "/typeorm/tools").dispatch({
					type: typeorm.RepoRestActions.GET_BY_ID,
					payload: id
				})
				return tool
			},
			onCreateNewRoom: (agentId: string, parentRoomId: string, parentMessageId: string): string => {
				// creo una nuova room
				const newRoom = createNewRoom(agentId, parentRoomId, parentMessageId)
				chat.rooms.push(newRoom)

				// [II] salvataggio nel DB
				
				const msg: NewRoomS2C = {
					action: CHAT_ACTION_S2C.NEW_ROOM,
					chatId: chat.id,
					roomId: newRoom.id,
					parentRoomId,
					parentMessageId,
				}
				this.sendToChat(msg)

				return newRoom.id
			},
			// quando l'agente invia un messaggio	
			onMessage: (agentId: string, messages?: CoreMessage[], roomId?: string): CoreMessage[] => {
				const room = getRoomById(chat, roomId)
				if (!messages || !messages.length) {
					return room.history
				}
				room.history.push(...messages)

				// salvataggio nel DB
				// new Bus(this, this.state.repository).dispatch({
				// 	type: typeorm.RepoRestActions.SAVE,
				// 	payload: roomIns.room
				// })
				const msg: AppendMessageS2C = {
					action: CHAT_ACTION_S2C.APPEND_MESSAGE,
					chatId: chat.id,
					roomId: room.id,
					content: messages,
				}
				this.sendToChat(msg)

				return room.history
			},
		}
		const agent = new AgentExe({ id: agentId }, resolver)
		agent.roomId = rootRoom.id // setto l'id della room nell'agente
		// creo l'istanza dell'agente
		const response = await agent.ask(prompt)
	}

	private getChatById(chatId: string): Chat | undefined {
		return this.chats.find(c => c.id === chatId)
	}

	/**
	 * Send a message to all clients in a chat
	 */
	private sendToChat(message: BaseS2C) {
		if (!message || !message.chatId) return this.log("missing roomId in message")
		const chat = this.chats.find(c => c.id === message.chatId)
		if (!chat) return this.log(`Room not found: ${chat.id}`)

		for (const clientAddress of chat.clients) {
			const client = this.getClient(clientAddress)
			if (!client) continue
			this.sendToClient(client, JSON.stringify(message))
		}
	}


	// [II] DA FARE
	private async loadChat(roomId: string): Promise<Chat> {
		// [II] prendere 
		const rooms: Room[] = [] //await new Bus(this, this.state.repository).dispatch({
		//	type: typeorm.RepoRestActions.GET_BY_ID,
		//	payload: roomId
		//})
		const chat: Chat = { id: randomUUID(), rooms, clients: new Set() }
		this.chats.push(chat)
		return chat
	}

}

export interface Chat {
	id: string
	rooms: Room[]
	clients: Set<string>
}


async function createNewChat(agentId: string): Promise<Chat> {
	const room = createNewRoom(agentId, null, null)
	const chat: Chat = {
		id: randomUUID(),
		rooms: [room],
		clients: new Set(),
	}
	return chat
}

function createNewRoom(agentId: string, parentRoomId: string, messageId: string): Room {
	const newRoom: Room = {
		id: randomUUID() as string,
		name: "",
		history: [],
		agentId,
		parentRoomId,
		messageId,
	}
	return newRoom
}

function getRoomById(chat: Chat, roomId?: string): Room {
	return chat?.rooms?.find(r => r.id == roomId)
}
function getRootRoom(chat: Chat): Room {
	return chat?.rooms?.find(r => r.parentRoomId == null)
}