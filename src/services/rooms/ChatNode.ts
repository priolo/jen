import { AccountDTO } from '@/types/account.js';
import { randomUUID } from "crypto";
import { AgentRepo } from "../../repository/Agent.js";
import { LlmResponse } from '../../types/commons/LlmResponse.js';
import { BaseS2C, CHAT_ACTION_S2C, ChatInfoS2C, ChatMessage, ClientEnteredS2C, ClientLeaveS2C, MessageUpdate, RoomAgentsUpdateS2C, RoomHistoryUpdateS2C, RoomNewS2C, UPDATE_TYPE } from "../../types/commons/RoomActions.js";
import { ChatContext } from "./ChatContext.js";
import RoomTurnBased from "./RoomTurnBased.js";



/**
 * Gestion CHAT per quanto riguarda: 
 * CLIENTs che sono entrati nella CHAT
 * Le ROOMs create all'interno della CHAT
 */
class ChatNode {

	private constructor(
		context: ChatContext,
		accountId?: string,
	) {
		this.context = context;
		this.accountId = accountId;
	}

	/**
	 * Creo una nuova CHAT inserendo una MAIN-ROOM
	 * @param context il CONTEXT di gestione della CHAT
	 * @param rooms le ROOMs iniziali della CHAT
	 * @param accountId l'ACCOUNT che ha creato la CHAT
	 */
	static async Build(context: ChatContext, rooms: RoomTurnBased[], accountId?: string): Promise<ChatNode> {
		const chat = new ChatNode(context, accountId)
		chat.rooms = rooms
		return chat
	}



	/** 
	 * identificativo della CHAT 
	 */
	public id: string = null

	/** 
	 * ACCOUNT che ha creato la CHAT 
	 */
	public accountId?: string

	/** 
	 * il CONTEXT per la gestione della CHAT  
	 * DEPENDENCY che si occupa della comunicazione e risorse
	 */
	private context: ChatContext;

	/** 
	 * le ROOM aperte in questa CHAT 
	 */
	public rooms: RoomTurnBased[] = [];

	/** 
	 * gli ids dei CLIENTs-WS partecipanti 
	 * cioe' quelli che devono essere aggiornati
	 */
	private clientsIds: Set<string> = new Set();



	/**
	 * Recupera la MAIN-ROOM della CHAT
	 */
	private getMainRoom(): RoomTurnBased {
		return this.rooms.find(room => room.room.parentRoomId == null)
	}

	/**
	 * Recupera una ROOM dalla CHAT
	 */
	public getRoomById(id?: string): RoomTurnBased {
		if (!id || !this.rooms) return null
		return this.rooms.find(room => room.room.id == id)
	}



	//#region HANDLE CHAT OPERATIONS

	/**
	 * comunico alla CHAT che un CLIENT è entrato
	 * aggiungo il CLIENT in CHAT
	 */
	addClient(clientId: string) {
		// se il CLIENT è già in CHAT non faccio nulla
		if (!clientId || this.clientsIds.has(clientId)) return;

		// ricavo i dati del CLIENT
		const client = (this.context.getAccountById(clientId))
		if (!client) return;

		// avverto gli altri CLIENT
		const message: ClientEnteredS2C = {
			action: CHAT_ACTION_S2C.CLIENT_ENTERED,
			chatId: this.id,
			client,
		}
		this.sendMessage(message)

		// inserisco il CLIENT nella CHAT
		this.clientsIds.add(clientId);

		// invio al nuovo CLIENT i dati della CHAT
		this.sendInfo(clientId)
	}

	/**
	 * comunico alla chat che un client ha lasciato la chat
	 * e lo elimino dalla CHAT
	 * @return true se la chat è vuota e può essere rimossa
	 */
	removeClient(clientId: string): boolean {
		if (!clientId || !this.clientsIds.has(clientId)) return false;

		// avverto tutti i CLIENTs
		const message: ClientLeaveS2C = {
			action: CHAT_ACTION_S2C.CLIENT_LEAVE,
			chatId: this.id,
			clientId,
		}
		this.sendMessage(message, [clientId]) // escludo il client che lascia

		this.clientsIds.delete(clientId);
		return this.clientsIds.size == 0
	}

	/** 
	 * aggiorno la HISTORY con una serie di MessageUpdate 
	 * Manda il messaggio di aggiornamento a tutti i partecipanti alla CHAT
	 */
	updateHistory(updates: MessageUpdate[], roomId?: string): RoomTurnBased {
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

		return room
	}

	/**
	 * Aggiorno la lista degli AGENTS in una ROOM della CHAT
	 */
	async updateAgents(agentsIds: string[] = [], roomId?: string): Promise<void> {
		const room = this.getRoomById(roomId) ?? this.getMainRoom()
		if (!room) return

		const agents: AgentRepo[] = []
		for (const agentId of agentsIds) {
			const agent = await this.context.getAgentRepoById(agentId)
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

	/**
	 * Restituisco le info della CHAT sotto forma di messaggio
	 */
	private sendInfo(clientId:string) {

		const clients: AccountDTO[] = [...this.clientsIds].map(clientId => {
			return this.context.getAccountById(clientId)
		}).filter(a => !!a)

		const rooms = this.rooms.map(r => ({
			id: r.room.id,
			chatId: this.id,
			parentRoomId: r.room.parentRoomId,
			accountId: r.room.accountId,
			history: r.room.history,
			agentsIds: r.room.agents?.map(a => a.id),
		}))

		const msg:ChatInfoS2C = {
			action: CHAT_ACTION_S2C.CHAT_INFO,
			chatId: this.id,
			clients,
			rooms,
		}

		this.context.sendMessageToClient(clientId, msg)
	}

	/**
	 * Invia a tutti i partecipanti della CHAT un MESSAGE
	 */
	private sendMessage(message: BaseS2C, esclude: string[] = []): void {
		for (const clientId of this.clientsIds) {
			if (esclude.includes(clientId)) continue;
			this.context.sendMessageToClient(clientId, message)
		}
	}

	//#endregion



	//#region CHAT PROCESSING

	/**
	 * Indico alla CHAT che una ROOM deve essere "completata"
	 */
	async complete(): Promise<LlmResponse> {
		// [II] assumo che da completare sia sempre la MAIN-ROOM
		let room: RoomTurnBased = this.getMainRoom()
		return await this.recursiveRequest(room)
	}

	/**
	 * Effettua una richiesta loop su una ROOM 
	 */
	private async recursiveRequest(room: RoomTurnBased): Promise<LlmResponse> {

		// [II] onTool, onSubAgent, onMessage devono essere dei parametri di getResponse
		room.onTool = async (toolId: string, args: any) => {
			return this.context.executeTool(toolId, args)
		}
		room.onSubAgent = async (requestAgentId, responseAgentId, question) => {

			// recupero il sub-agente dal DB
			const agentRepo: AgentRepo = await this.context.getAgentRepoById(responseAgentId)
			if (!agentRepo) return null;

			// creo una nuova room per il sub-agente
			const subRoom = RoomTurnBased.BuildRoom(this.id, [agentRepo], this.accountId, room.room.id)
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
			const msgUpd: MessageUpdate = {
				type: UPDATE_TYPE.APPEND,
				content: {
					id: randomUUID(),
					clientId: requestAgentId,
					role: "user",
					content: question,
				},
			}
			this.updateHistory([msgUpd], subRoom.room.id);

			// effettuo la ricorsione su questa nuova ROOM-AGENT
			const response = await this.recursiveRequest(subRoom)
			return {
				response,
				roomId: subRoom.room.id
			}
		}
		room.onMessage = (chatMessage: ChatMessage, roomId: string) => {
			const msgUpd: MessageUpdate = {
				type: UPDATE_TYPE.APPEND,
				content: chatMessage,
			}
			this.updateHistory([msgUpd], roomId);
		}

		return await room.getResponse()
	}

	//#endregion

}

export default ChatNode