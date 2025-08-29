import { AgentRepo } from "@/repository/Agent.js";
import { RoomRepo } from "@/repository/Room.js";
import IRoomsChats from "@/routers/IRoomsChats.js";
import { MessageS2C, BaseS2C, CHAT_ACTION_S2C, ChatMessage, NewRoomS2C, UserEnteredS2C } from "@/types/commons/RoomActions.js";
import { ContentCompleted, LLM_RESPONSE_TYPE, LlmResponse } from '../../types/commons/LlmResponse.js';
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
	private rooms: RoomTurnBased[] = []
	/** tutti i client WS */
	private clientsIds: Set<string> = new Set();


	//#region HANDLE CHAT OPERATIONS

	/**
	 * comunico alla chat che un client è entrato nella chat
	 */
	async enterClient(clientId: string, agentId: string): Promise<void> {
		// inserisco il client
		this.clientsIds.add(clientId);
		// creo una nuova room se non esiste
		let room: RoomTurnBased = this.getMainRoom()
		if (!room) {
			const roomRepo = await this.node.createRoomRepo()
			room = new RoomTurnBased(roomRepo)
			this.rooms.push(room);
		}
		// carico l'agente e lo inserisco nella room
		const agentRepo = await this.node.getAgentRepoById(agentId)
		if (!agentRepo) throw new Error(`Agent with id ${agentId} not found`);
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
	 * @return true se la chat è vuota e può essere rimossa
	 */
	removeClient(clientId: string): boolean {
		// INVIO
		const message: BaseS2C = {
			action: CHAT_ACTION_S2C.LEAVE,
			chatId: this.id,
		}
		this.sendMessageToClients(message)
		// ---

		this.clientsIds.delete(clientId);
		return this.clientsIds.size == 0
	}

	/**
	 * comunico alla CHAT che un MESSAGE di tipo USER è stato inserito in una ROOM
	 */
	addUserMessage(text: string, authorId: string, roomId: string): void {
		// inserisco il messaggio nella history
		let room: RoomTurnBased = this.getRoomById(roomId)
		const chatMessage = room.addUserMessage(text, authorId)

		// e lo invio a tutti i partecipanti alla chat
		const msgToClient: MessageS2C = {
			action: CHAT_ACTION_S2C.MESSAGE,
			chatId: this.id,
			roomId: room.room.id,
			content: chatMessage,
		}
		this.sendMessageToClients(msgToClient)
	}

	async complete(authorId: string): Promise<LlmResponse> {
		// assumo che da completare sia sempre la MAIN-ROOM
		let room: RoomTurnBased = this.getMainRoom()
		return await this.recursiveRequest(room, authorId)
	}

	//#endregion





	private async recursiveRequest(room: RoomTurnBased, authorId?: string): Promise<LlmResponse> {

		room.onTool = async (toolId: string, args: any) => {
			return this.node.executeTool(toolId, args)
		}
		room.onSubAgent = async (agentId, question) => {

			// recupero il sub-agente dal DB
			const agentRepo: AgentRepo = await this.node.getAgentRepoById(agentId)
			if (!agentRepo) return null;

			// creo una nuova room per il sub-agente
			const subRoomRepo: RoomRepo = await this.node.createRoomRepo([agentRepo], room.room.id)
			const subRoom = new RoomTurnBased(subRoomRepo)
			this.rooms.push(subRoom);

			// invia la nuova ROOM-AGENT al CLIENT
			const newRoomMsg: NewRoomS2C = {
				action: CHAT_ACTION_S2C.NEW_ROOM,
				chatId: this.id,
				roomId: subRoom.room.id,
				parentRoomId: room.room.id,
				agentId: agentRepo.id,
			}
			this.sendMessageToClients(newRoomMsg)

			// inserisco il messaggio dell'utente nella nuova ROOM
			this.addUserMessage(question, authorId, subRoom.room.id)

			// effettuo la ricorsione su questa nuova ROOM-AGENT
			const llmResponse = await this.recursiveRequest(subRoom, agentId)
			if (llmResponse.type != LLM_RESPONSE_TYPE.COMPLETED) return null
			return (<ContentCompleted>llmResponse.content).answer
		}
		room.onLoop = (roomId: string, agentId: string, chatMessage: ChatMessage) => {
			// INVIO
			const msgToClient: MessageS2C = {
				action: CHAT_ACTION_S2C.MESSAGE,
				chatId: this.id,
				roomId: roomId,
				content: chatMessage,
			}
			this.sendMessageToClients(msgToClient)
			// ---
		}

		return await room.getResponse()
	}

	private getMainRoom(): RoomTurnBased {
		return this.rooms.find(room => room.room.parentRoomId == null)
	}
	private getRoomById(id?: string): RoomTurnBased {
		return this.rooms.find(room => room.room.id == id)
	}

	private sendMessageToClients(message: BaseS2C): void {
		for (const clientId of this.clientsIds) {
			this.node.sendMessageToClient(clientId, message)
		}
	}


}

export default ChatNode