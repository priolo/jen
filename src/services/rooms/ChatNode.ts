import { randomUUID } from "crypto";
import { AgentRepo } from "../../repository/Agent.js";
import { RoomRepo } from "../../repository/Room.js";
import ChatContext from "../../services/rooms/ChatContext.js";
import { LlmResponse } from '../../types/commons/LlmResponse.js';
import { BaseS2C, CHAT_ACTION_S2C, ChatInfoS2C, ChatMessage, ClientEnteredS2C, MessageUpdate, RoomAgentsUpdateS2C, RoomHistoryUpdateS2C, RoomMessageS2C, RoomNewS2C, UPDATE_TYPE } from "../../types/commons/RoomActions.js";
import RoomTurnBased from "./RoomTurnBased.js";


/**
 * contiente i CLIENTs che vengono aggiornati
 * contiene le ROOMs dove avvengono le elaborazioni con gli AGENTs
 * ha node che è il CONTEXT che gli fornisce i REPOSITORY
 */
class ChatNode {
	constructor(
		node: ChatContext,
	) {
		this.node = node;
	}

	/** identificativo della CHAT */
	public id: string = crypto.randomUUID();
	/** 
	 * il NODE del contesto. Deve implementare ChatContext
	 * probabilmente è un WSRoomsService
	 * */
	private node: ChatContext;
	/** 
	 * le ROOM aperte in questa CHAT 
	 */
	public rooms: RoomTurnBased[]
	/** 
	 * gli ids dei CLIENTs-WS partecipanti 
	 * cioe' che devono essere aggiornati
	 */
	private clientsIds: Set<string> = new Set();


	//#region HANDLE CHAT OPERATIONS

	/**
	 * Creo una nuova CHAT inserendo una MAIN-ROOM
	 */
	static async Build(node: ChatContext, rooms: RoomTurnBased[]): Promise<ChatNode> {
		const chat = new ChatNode(node)
		chat.rooms = rooms
		return chat
	}

	/**
	 * Crea una MAIN-ROOM con gli AGENTs specificati
	 */
	static async BuildRoom(node: ChatContext, agentsIds: string[] = []): Promise<RoomTurnBased> {
		// carico gli agenti REPO
		const agentsRepo: AgentRepo[] = []
		for (const agentId of agentsIds) {
			const agentRepo = await node.getAgentRepoById(agentId)
			if (agentRepo) agentsRepo.push(agentRepo)
		}
		// creo una nuova MAIN-ROOM
		const roomRepo = await node.createRoomRepo(agentsRepo, null)
		const room = new RoomTurnBased(roomRepo)
		return room
	}



	/**
	 * comunico alla CHAT che il CLIENT è entrato
	 * aggiungo il CLIENT per aggiornarlo
	 */
	enterClient(clientId: string) {
		if (!clientId || this.clientsIds.has(clientId)) return;

		// avverto gli altri CLIENT
		const message: ClientEnteredS2C = {
			action: CHAT_ACTION_S2C.CLIENT_ENTERED,
			chatId: this.id,
			clientId: clientId,
		}
		this.sendMessage(message)

		// invio al nuovo CLIENT i dati della CHAT
		this.sendInfoToClient(clientId)

		// inserisco il CLIENT nella CHAT
		this.clientsIds.add(clientId);
	}

	/**
	 * comunico alla chat che un client ha lasciato la chat
	 * e lo elimino dalla CHAT
	 * @return true se la chat è vuota e può essere rimossa
	 */
	removeClient(clientId: string): boolean {
		// avverto tutti i CLIENTs
		const message: BaseS2C = {
			action: CHAT_ACTION_S2C.CLIENT_LEAVE,
			chatId: this.id,
		}
		this.sendMessage(message)

		this.clientsIds.delete(clientId);
		return this.clientsIds.size == 0
	}

	/** 
	 * MESSAGE di tipo USER è stato inserito in una ROOM della CHAT
	 * con clientId=null è GENERIC-USER
	 * con roomId=null  è la MAIN-ROOM
	 */
	private addUserMessage(text: string, clientId?: string, roomId?: string): void {
		// inserisco il messaggio nella history
		const room: RoomTurnBased = this.getRoomById(roomId) ?? this.getMainRoom()
		const msg: ChatMessage = {
			id: randomUUID(),
			clientId: clientId,
			role: "user",
			content: text,
		}
		room.updateHistory({
			type: UPDATE_TYPE.APPEND,
			content: msg,
		})
		// e lo invio a tutti i partecipanti alla chat
		this.sendChatMessage(msg, room.room.id)
	}

	/** 
	 * aggiorno la HISTORY con una serie di MessageUpdate 
	 */
	updateHistory(updates: MessageUpdate[], roomId?: string): void {
		const room = this.getRoomById(roomId) ?? this.getMainRoom()
		if (!room) throw new Error("Room not found")

		room.updateHistory(updates);

		// avviso tutti i partecipanti
		const msg: RoomHistoryUpdateS2C = {
			action: CHAT_ACTION_S2C.ROOM_HISTORY_UPDATE,
			chatId: this.id,
			roomId: room.room.id,
			updates: updates,
		}
		this.sendMessage(msg)
	}

	/**
	 * Indico alla CHAT che una ROOM deve essere "completata"
	 */
	async complete(): Promise<LlmResponse> {
		// [II] assumo che da completare sia sempre la MAIN-ROOM
		let room: RoomTurnBased = this.getMainRoom()
		return await this.recursiveRequest(room)
	}

	/**
	 * Aggiorno la lista degli AGENTS in una ROOM della CHAT
	 */
	async updateAgents(agentsIds: string[] = [], roomId?: string): Promise<void> {
		const room = this.getRoomById(roomId) ?? this.getMainRoom()
		if (!room) return

		const agents: AgentRepo[] = []
		for (const agentId of agentsIds) {
			const agent = await this.node.getAgentRepoById(agentId)
			if (agent) agents.push(agent)
		}
		room.room.agents = agents

		// avviso tutti i partecipanti
		const msg: RoomAgentsUpdateS2C = {
			action: CHAT_ACTION_S2C.ROOM_AGENTS_UPDATE,
			chatId: this.id,
			roomId: room.room.id,
			agentsIds: agentsIds,
		}
		this.sendMessage(msg)
	}



	//#endregion




	/**
	 * Effettua una richiesta loop su una ROOM 
	 */
	private async recursiveRequest(room: RoomTurnBased): Promise<LlmResponse> {

		// [II] onTool, onSubAgent, onMessage devono essere dei parametri di getResponse
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
				agentsIds: [agentRepo.id],
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
	public getRoomById(id?: string): RoomTurnBased {
		if (!id || !this.rooms) return null
		return this.rooms.find(room => room.room.id == id)
	}


	/**
	 * Invia ad uno specifico CLIENT le INFO della CHAT
	 */
	private sendInfoToClient(clientId: string) {
		if (!clientId) return;
		const msg: ChatInfoS2C = {
			action: CHAT_ACTION_S2C.CHAT_INFO,
			chatId: this.id,
			clientsIds: [...this.clientsIds],
			rooms: this.rooms.map(r => ({
				chatId: this.id,
				id: r.room.id,
				parentRoomId: r.room.parentRoomId,
				history: r.room.history,
				agentsIds: r.room.agents?.map(a => a.id),
			})),
		}
		this.node.sendMessageToClient(clientId, msg)
	}

	/**
	 * invia a tutti i partecipanti un CHAT-MESSAGE
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
	 * Invia a tutti i partecipanti un MESSAGE
	 */
	private sendMessage(message: BaseS2C): void {
		for (const clientId of this.clientsIds) {
			this.node.sendMessageToClient(clientId, message)
		}
	}


}

export default ChatNode