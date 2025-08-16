import { AgentRepo } from "@/repository/Agent.js";
import { RoomRepo } from "@/repository/Room.js";
import { WSRoomsService } from "@/routers/RoomsWSRoute.js";
import { AppendMessageS2C, BaseS2C, CHAT_ACTION_S2C, UserEnteredS2C } from "@/types/RoomActions.js";
import { Response } from '../agents/types.js';
import RoomTurnBased from "./RoomTurnBased.js";






class ChatNode {
	constructor(
		node: WSRoomsService,
	) {
		this.node = node;
	}

	public id: string = crypto.randomUUID();
	private node: WSRoomsService;
	private rooms: RoomTurnBased[] = []
	private clientsIds: Set<string> = new Set();


	//#region HANDLE CHAT OPERATIONS

	/**
	 * comunico alla chat che un client è entrato nella chat
	 */
	async enterClient(clientId: string, agentId: string): Promise<void> {
		// inserisco il client
		this.clientsIds.add(clientId);
		// creo una nuova room se non esiste
		let room: RoomTurnBased = this.getRootRoom()
		if (!room) {
			const roomRepo = await this.node.createRoomRepo()
			room = new RoomTurnBased(roomRepo)
			this.rooms.push(room);
		}
		// inserisco l'agente nella room
		const agentRepo = await this.node.getAgentRepoById(agentId);
		room.room.agents.push(agentRepo);

		// INVIO: creo e invio il messaggio di entrata
		const message: UserEnteredS2C = {
			action: CHAT_ACTION_S2C.ENTERED,
			chatId: this.id,
			roomId: room.room.id,
		}
		this.sendMessageToClients(message)
		// ---
	}

	/**
	 * comunico alla chat che un client ha lasciato la chat
	 */
	removeClient(clientId: string): void {
		// INVIO
		const message: BaseS2C = {
			action: CHAT_ACTION_S2C.LEAVE,
			chatId: this.id,
		}
		this.sendMessageToClients(message)
		// ---

		this.clientsIds.delete(clientId);
		if (this.clientsIds.size === 0) {
			this.rooms = [];
			this.node.removeChat(this.id);
		}
	}

	/**
	 * comunico alla chat che un client ha inserito un messaggio
	 */
	async userMessage(clientId: string, question: string) {
		// assumo che un messaggio utente arrivi sempre nella main room
		let room: RoomTurnBased = this.getRootRoom()
		room.addUserMessage(question)

		// INVIO
		const msgToClient: AppendMessageS2C = {
			action: CHAT_ACTION_S2C.APPEND_MESSAGE,
			chatId: this.id,
			roomId: room.room.id,
			content: [{ role: "user", content: question }],
		}
		this.sendMessageToClients(msgToClient)
		// ---
	}

	async complete() {
		// assumo che da completare sia sempre la root room
		let room: RoomTurnBased = this.getRootRoom()
		const resp = await this.recursiveRequest(room)
		// [TO DO]
	}

	//#endregion





	private async recursiveRequest(room: RoomTurnBased, question?: string): Promise<Response> {

		room.onTool = (toolId: string, args: any) => this.node.executeTool(toolId, args)
		room.onSubAgent = async (agentId, question) => {
			const agentRepo: AgentRepo = await this.node.getAgentRepoById(agentId)
			if (!agentRepo) return null;
			const subRoomRepo: RoomRepo = await this.node.createRoomRepo([agentRepo], room.room.id)
			const subRoom = new RoomTurnBased(subRoomRepo)
			this.rooms.push(subRoom);
			const resp = await this.recursiveRequest(subRoom, question)
			return resp
		}
		room.onLoop = (roomId: string, agentId: string, result: any) => {
			// INVIO
			const msgToClient: AppendMessageS2C = {
				action: CHAT_ACTION_S2C.APPEND_MESSAGE,
				chatId: this.id,
				agentId: agentId,
				roomId: roomId,
				content: [{ role: "assistant", content: result }],
			}
			this.sendMessageToClients(msgToClient)
			// ---
		}
		if (!!question) room.addUserMessage(question)

		return room.getResponse()
	}

	private getRootRoom(): RoomTurnBased {
		return this.rooms.find(room => room.room.parentRoomId == null)
	}
	
	private sendMessageToClients(message: BaseS2C): void {
		for (const clientId of this.clientsIds) {
			this.node.sendMessageToClient(clientId, JSON.stringify(message));
		}
	}


}

export default ChatNode