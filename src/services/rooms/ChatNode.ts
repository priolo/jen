import { AgentRepo } from "@/repository/Agent.js";
import { RoomRepo } from "@/repository/Room.js";
import IRoomsChats from "@/services/rooms/IRoomsChats.js";
import { BaseS2C, CHAT_ACTION_S2C, ChatMessage, ClientEnteredS2C, RoomMessageS2C, RoomNewS2C, UserEnteredS2C } from "@/types/commons/RoomActions.js";
import { LlmResponse } from '../../types/commons/LlmResponse.js';
import RoomTurnBased from "./RoomTurnBased.js";


/**
 * Implementazione di una CHAT 
 * permette la conversazione degli AGENT e dello USER
 * con gestione di più stanze (ROOM) 
 */
class ChatNode {
	constructor(
		node: IRoomsChats,
	) {
		this.node = node;
	}

	/** identificativo della CHAT */
	public id: string = crypto.randomUUID();
	/** il NODE del contesto */
	private node: IRoomsChats;
	/** le ROOM aperte in questa CHAT */
	private rooms: RoomTurnBased[]
	/** tutti i client WS */
	private clientsIds: Set<string> = new Set();


	//#region HANDLE CHAT OPERATIONS

	/** inizializza la CHAT con un AGENT di riferimento */
	async init(agentId: string) {
		// carico l'agente e lo inserisco nella MAIN-ROOM
		const agentRepo = await this.node.getAgentRepoById(agentId)
		if (!agentRepo) throw new Error(`Agent with id ${agentId} not found`);

		// creo una nuova MAIN-ROOM
		const roomRepo = await this.node.createRoomRepo([agentRepo], null)
		const room = new RoomTurnBased(roomRepo)
		this.rooms = [room]
	}

	/**
	 * comunico alla CHAT che un CLIENT è entrato nella chat
	 * e lo aggiungo in CHAT
	 */
	async enterClient(clientId: string) {
		if (!clientId || this.clientsIds.has(clientId)) return;
		
		// invio a tutti gli altri CLIENT
		const message: ClientEnteredS2C = {
			action: CHAT_ACTION_S2C.CLIENT_ENTERED,
			chatId: this.id,
			clientId: clientId,
		}
		this.sendMessage(message)

		// invio al CLIENT che entra la lista delle ROOM
		const msg: UserEnteredS2C = {
			action: CHAT_ACTION_S2C.USER_ENTERED,
			chatId: this.id,
			clientsIds: [...this.clientsIds],
			rooms: this.rooms.map(r => ({
				id: r.room.id,
				parentRoomId: r.room.parentRoomId,
				history: r.room.history,
				agentsIds: r.room.agents?.map(a => a.id),
			})),
		}
		this.node.sendMessageToClient(clientId, msg)
		
		// inserisco il CLIENT nella CHAT
		this.clientsIds.add(clientId);
	}

	/**
	 * comunico alla chat che un client ha lasciato la chat
	 * e lo elimino dalla CHAT
	 * @return true se la chat è vuota e può essere rimossa
	 */
	removeClient(clientId: string): boolean {
		// INVIO
		const message: BaseS2C = {
			action: CHAT_ACTION_S2C.CLIENT_LEAVE,
			chatId: this.id,
		}
		this.sendMessage(message)
		// ---

		this.clientsIds.delete(clientId);
		return this.clientsIds.size == 0
	}

	/**
	 * un MESSAGE di tipo USER è stato inserito in una ROOM della CHAT
	 * se non si specifica la ROOM allora è la MAIN-ROOM
	 */
	addUserMessage(text: string, clientId: string, roomId?: string): void {
		// inserisco il messaggio nella history
		const room: RoomTurnBased = this.getRoomById(roomId) ?? this.getMainRoom()
		const chatMessage = room.addUserMessage(text, clientId)
		// e lo invio a tutti i partecipanti alla chat
		this.sendChatMessage(chatMessage, room.room.id)
	}

	/**
	 * Indico alla CHAT che una ROOM deve essere "completata"
	 */
	async complete(): Promise<LlmResponse> {
		// [II] assumo che da completare sia sempre la MAIN-ROOM
		let room: RoomTurnBased = this.getMainRoom()
		return await this.recursiveRequest(room)
	}

	//#endregion




	/**
	 * Effettua una richiesta loop su una ROOM 
	 */
	private async recursiveRequest(room: RoomTurnBased): Promise<LlmResponse> {

		room.onTool = async (toolId: string, args: any) => {
			return this.node.executeTool(toolId, args)
		}
		room.onSubAgent = async (requestAgentId, responseAgentId, question) => {

			// recupero il sub-agente dal DB
			const agentRepo: AgentRepo = await this.node.getAgentRepoById(responseAgentId)
			if (!agentRepo) return null;

			// creo una nuova room per il sub-agente
			const subRoomRepo: RoomRepo = await this.node.createRoomRepo([agentRepo], room.room.id)
			const subRoom = new RoomTurnBased(subRoomRepo)
			this.rooms.push(subRoom);

			// invia la nuova ROOM-AGENT al CLIENT
			const newRoomMsg: RoomNewS2C = {
				action: CHAT_ACTION_S2C.ROOM_NEW,
				chatId: this.id,
				roomId: subRoom.room.id,
				parentRoomId: room.room.id,
				agentId: agentRepo.id,
			}
			this.sendMessage(newRoomMsg)

			// inserisco il messaggio di tipo utente nella nuova ROOM
			this.addUserMessage(question, requestAgentId, subRoom.room.id)

			// effettuo la ricorsione su questa nuova ROOM-AGENT
			const response = await this.recursiveRequest(subRoom)
			return { 
				response, 
				roomId: subRoom.room.id
			}
		}
		room.onMessage = (chatMessage: ChatMessage, roomId: string) => 
			this.sendChatMessage(chatMessage, roomId)

		return await room.getResponse()
	}

	private getMainRoom(): RoomTurnBased {
		return this.rooms.find(room => room.room.parentRoomId == null)
	}
	private getRoomById(id?: string): RoomTurnBased {
		return this.rooms.find(room => room.room.id == id)
	}

	/**
	 * invia alla CHAT un CHAT-MESSAGE
	 */
	private sendChatMessage(chatMessage: ChatMessage, roomId: string) {
		const msgToClient: RoomMessageS2C = {
			action: CHAT_ACTION_S2C.ROOM_MESSAGE,
			chatId: this.id,
			roomId: roomId,
			content: chatMessage,
		}
		this.sendMessage(msgToClient)
	}

	/**
	 * Invia alla CHAT un MESSAGE
	 * @param message 
	 */
	private sendMessage(message: BaseS2C): void {
		for (const clientId of this.clientsIds) {
			this.node.sendMessageToClient(clientId, message)
		}
	}


}

export default ChatNode