import { Bus, typeorm, ws } from "@priolo/julian"
import AgentExe, { Resolver } from "../agents/llm/AgentExe.js"
import { Agent } from "../repository/Agent.js"
import { Room } from "../repository/Room.js"
import { Tool } from "../repository/Tool.js"
import { AppendMessageS2C, BaseC2S, BaseS2C, ROOM_ACTION_C2S, ROOM_ACTION_S2C, RoomSetup, UserEnterC2S, UserEnteredS2C, UserMessageC2S } from "../types/RoomActions.js"
import { CoreMessage, CoreUserMessage } from "ai"



export type WSRoomsConf = Partial<WSRoomsService['stateDefault']>

/**
 * WebSocket service for managing prompt chat rooms
 */
export class WSRoomsService extends ws.route {

	private rooms: RoomInstance[] = []

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
		// rimuovo il client dalla room
		for (const roomInstance of this.rooms) {
			roomInstance.clients.delete(client.remoteAddress)
			// se non ci sono piu' client nella room la elimino
			if (roomInstance.clients.size === 0) {
				this.rooms = this.rooms.filter(r => r !== roomInstance)
			}
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
			case ROOM_ACTION_C2S.ENTER:
				await this.handleEnter(client, msg as UserEnterC2S)
				break
			case ROOM_ACTION_C2S.LEAVE:
				break
			case ROOM_ACTION_C2S.USER_MESSAGE:
				await this.handleUserMessage(client, msg as UserMessageC2S)
				break
			case ROOM_ACTION_C2S.COMPLETE:
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
		let roomInstance: RoomInstance

		// se non c'e' l'id allora creo un istanza nuova
		if (!msg.roomId) {
			roomInstance = await this.createChat()
			// altrimenti cerco l'istanza della room
		} else {
			roomInstance = this.getRoomById(msg.roomId)
			// se la room non c'e la carico dal DB e la inserisco
			if (!roomInstance) {
				roomInstance = await this.loadRoom(msg.roomId)
			}
		}

		// se c'e' metto il SETUP
		if (msg.setup) {
			this.setRoomSetup(roomInstance.room, msg.setup)
		}

		// aggiungo il client alla room
		roomInstance.clients.add(client.remoteAddress)

		// creo e invio il messaggio di entrata
		const message: UserEnteredS2C = {
			action: ROOM_ACTION_S2C.ENTERED,
			roomId: roomInstance.room.id,
			setup: this.getRoomSetup(roomInstance.room),
		}
		this.sendToRoom(message)
	}

	private setRoomSetup(room: Room, setup: RoomSetup): void {
		room.agentId = setup.agentId
		// // salvataggio nel DB
		// await new Bus(this, this.state.repository).dispatch({
		// 	type: typeorm.RepoRestActions.SAVE,
		// 	payload: roomInstance.room
		// })
	}
	private getRoomSetup(room: Room): RoomSetup {
		return {
			agentId: room.agentId
		}
		// // salvataggio nel DB
		// await new Bus(this, this.state.repository).dispatch({
		// 	type: typeorm.RepoRestActions.SAVE,
		// 	payload: roomInstance.room
		// })
	}

	private async handleUserMessage(client: ws.IClient, msg: UserMessageC2S) {
		const roomInstance = this.getRoomById(msg.roomId)
		if (!!msg.complete) {
			this.complete(roomInstance, msg.text)
		} else {
			const item: CoreUserMessage = {
				role: "user",
				content: msg.text,
			}
			roomInstance.room.history.push(item)
			this.sendToRoom(<AppendMessageS2C>{
				action: ROOM_ACTION_S2C.APPEND_MESSAGE,
				roomId: msg.roomId,
				content: [item],
			})
		}
	}

	private async complete(roomIns: RoomInstance, prompt: string): Promise<void> {
		const agentId = roomIns.room.agentId
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
			getHistory: (id: string) => {
				if (!roomIns?.room) return []
				return roomIns.room.history
			},
			onHistoryChange: (history: CoreMessage[]) => {
				const newMsgs = history.slice(roomIns.room.history.length)
				roomIns.room.history = history
				// salvataggio nel DB
				// new Bus(this, this.state.repository).dispatch({
				// 	type: typeorm.RepoRestActions.SAVE,
				// 	payload: roomIns.room
				// })
				const appendMessage: AppendMessageS2C = {
					action: ROOM_ACTION_S2C.APPEND_MESSAGE,
					roomId: roomIns.room.id,
					content: newMsgs,
				}
				this.sendToRoom(appendMessage)
			}
		}
		const agent = new AgentExe({ id: agentId }, resolver)
		// creo l'istanza dell'agente
		const response = await agent.ask(prompt)
	}

	private getRoomById(roomId: string): RoomInstance | undefined {
		return this.rooms.find(r => r.room.id === roomId)
	}

	private sendToRoom(message: BaseS2C) {
		if (!message || !message.roomId) return this.log("missing roomId in message")
		const roomInstance = this.rooms.find(r => r.room.id === message.roomId)
		if (!roomInstance) return this.log(`Room not found: ${roomInstance.room.id}`)

		for (const clientAddress of roomInstance.clients) {
			const client = this.getClient(clientAddress)
			if (!client) continue
			this.sendToClient(client, JSON.stringify(message))
		}
	}

	private async createChat(): Promise<RoomInstance> {
		const room: Room = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.RepoRestActions.SAVE,
			payload: { name: "New Room" } // TODO: prendere il nome dal client
		})
		const roomInstance: RoomInstance = { room, clients: new Set() }
		this.rooms.push(roomInstance)
		return roomInstance
	}

	private async loadRoom(roomId: string): Promise<RoomInstance> {
		const room: Room = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.RepoRestActions.GET_BY_ID,
			payload: roomId
		})
		const roomInstance: RoomInstance = { room, clients: new Set() }
		this.rooms.push(roomInstance)
		return roomInstance
	}

}

export interface RoomInstance {
	room: Room
	clients: Set<string>
}


