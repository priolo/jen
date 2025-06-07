import { AppendMessageS2C, BaseC2S, BaseS2C, ROOM_ACTION_C2S, ROOM_ACTION_S2C, UserEnterC2S, UserEnteredS2C, UserMessageC2S } from "@/types/WSMessages.js"
import { Bus, typeorm, ws } from "@priolo/julian"
import { Room } from "../repository/Room.js"



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
	 * Handle client disconnection
	 */
	onDisconnect(client: ws.IClient) {
		// TO DO
		super.onDisconnect(client)
	}



	/**
	 * Handle client entering a room
	 */
	private async handleEnter(client: ws.IClient, msg: UserEnterC2S) {
		let roomInstance: RoomInstance

		// se non c'e' l'id allora creo un istanza nuova
		if (!msg.roomId) {
			roomInstance = await this.createRoom()
			// altrimenti cerco l'istanza della room
		} else {
			roomInstance = this.rooms.find(r => r.room.id === msg.roomId)
			// se la room non c'e la carico e la inserisco
			if (!roomInstance) {
				roomInstance = await this.loadRoom(msg.roomId)
			}
		}
		roomInstance.clients.add(client.remoteAddress)

		// creo e invio il messaggio
		const message: UserEnteredS2C = {
			action: ROOM_ACTION_S2C.ENTERED,
			roomId: roomInstance.room.id,
		}
		this.sendToRoom(message)
	}

	private async handleUserMessage(client: ws.IClient, msg: UserMessageC2S) {
		this.sendToRoom(<AppendMessageS2C>{
			action: ROOM_ACTION_S2C.APPEND_MESSAGE,
			roomId: msg.roomId,
			text: msg.text,
		})
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

	private async createRoom(): Promise<RoomInstance> {
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


