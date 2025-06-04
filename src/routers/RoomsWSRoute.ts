import { Bus, typeorm, ws } from "@priolo/julian"
import { HistroyMessage, Room } from "../repository/Room.js"



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
		const msg = JSON.parse(message) as BaseMessage

		switch (msg.action) {
			case ROOM_ACTION_C2S.ENTER:
				await this.handleEnter(client, msg as EnterMessage)
				break
			case ROOM_ACTION_C2S.LEAVE:
				break
			case ROOM_ACTION_C2S.HISTORY_UPDATE:
				await this.handleHistoryUpdate(client, msg as HistoryUpdateMessage)
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
	private async handleEnter(client: ws.IClient, msg: EnterMessage) {

		let roomInstance = this.rooms.find(r => r.room.id === msg.roomId)

		// se la room non c'e la carico e la inserisco
		if (!roomInstance) {
			const room: Room = await new Bus(this, this.state.repository).dispatch({
				type: typeorm.RepoRestActions.GET_BY_ID,
				payload: msg.roomId
			})
			roomInstance = { room, clients: new Set() }
			this.rooms.push(roomInstance)
		}

		roomInstance.clients.add(client.remoteAddress)

		this.sendToClient(client, JSON.stringify({
			action: ROOM_ACTION_S2C.ENTERED,
			roomId: msg.roomId,
		}))
	}

	private async handleHistoryUpdate(client: ws.IClient, msg: HistoryUpdateMessage) {
		if (!msg.roomId) return this.log("History update message missing roomId")
		const roomInstance = this.rooms.find(r => r.room.id === msg.roomId)
		if (!roomInstance) return this.log(`Room not found: ${msg.roomId}`)
		const room = roomInstance.room


		for (const update of msg.updates) {
			switch (update.type) {
				case UPDATE_TYPE.ADD:
					if (update.index !== undefined) {
						room.history.splice(update.index, 0, update.message)
					} else {
						room.history.push(update.message)
					}
					break
				case UPDATE_TYPE.REMOVE:
					if (update.index !== undefined) {
						room.history.splice(update.index, 1)
					}
					break
				case UPDATE_TYPE.UPDATE:
					if (update.index !== undefined && room.history[update.index]) {
						room.history[update.index] = update.message
					}
					break
				default:
					console.warn(`Unknown update type: ${update.type}`)
					break
			}
		}

		// Notify all clients in the room about the history update
		roomInstance.clients.forEach(clientAddress => {
			const client = this.getClient(clientAddress)
			const message: HistoryUpdatedMessage = {
				action: ROOM_ACTION_S2C.HISTORY_UPDATED,
				roomId: msg.roomId,
				updates: msg.updates,
			}
			this.sendToClient(client, JSON.stringify(message))
		})
	}

}

export interface RoomInstance {
	room: Room
	clients: Set<string>
}


//#region SERVER TO CLIENT

export type BaseMessage = {
	action: ROOM_ACTION_C2S
	/** ID of the room to enter */
	roomId: string
}

export type EnterMessage = BaseMessage & {
	action: ROOM_ACTION_C2S.ENTER
}

export type HistoryUpdateMessage = BaseMessage & {
	action: ROOM_ACTION_C2S.HISTORY_UPDATE
	updates: UpdateMessage[]
}

export interface UpdateMessage {
	type: UPDATE_TYPE
	index?: number
	message: HistroyMessage
}
export enum UPDATE_TYPE {
	ADD = "add",
	REMOVE = "remove",
	UPDATE = "update",
}

export type CompleteMessage = BaseMessage & {
	action: ROOM_ACTION_C2S.COMPLETE
}

export enum ROOM_ACTION_C2S {
	ENTER = "enter",
	LEAVE = "leave",
	HISTORY_UPDATE = "history-update",
	COMPLETE = "complete",
}

//#endregion




//#region SERVER TO CLIENT

export enum ROOM_ACTION_S2C {
	ENTERED = "entered",
	LEAVE = "leave",
	HISTORY_UPDATED = "history-updated",
}

export type HistoryUpdatedMessage = {
	action: ROOM_ACTION_S2C.HISTORY_UPDATED
	roomId: string
	updates: UpdateMessage[]
}

//#endregion