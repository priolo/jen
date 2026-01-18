import { AccountDTO } from '@/types/account.js';
import { randomUUID } from "crypto";
import { AgentRepo } from "../../repository/Agent.js";
import { LlmResponse } from '../../types/commons/LlmResponse.js';
import { BaseS2C, CHAT_ACTION_S2C, ChatInfoS2C, ChatMessage, ClientEnteredS2C, ClientLeaveS2C, MessageUpdate, RoomAgentsUpdateS2C, RoomHistoryUpdateS2C, RoomNewS2C, UPDATE_TYPE } from "../../types/commons/RoomActions.js";
import { IChatContext } from "./IChatContext.js";
import RoomTurnBase from "./RoomTurnBase.js";
import { IRoomHandlers } from "./IRoomHandlers.js";
import AgentLlm from './AgentLlm.js';
import { RoomConversationManager } from './RoomConversationManager.js';



/**
 * Gestion CHAT per quanto riguarda: 
 * CLIENTs che sono entrati nella CHAT
 * Le ROOMs create all'interno della CHAT
 */
class ChatNode {

	private constructor(
		context: IChatContext,
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
	static async Build(context: IChatContext, rooms: RoomTurnBase[], accountId?: string): Promise<ChatNode> {
		const chat = new ChatNode(context, accountId)
		chat.rooms = rooms
		return chat
	}


	
	//#region CHAT PROPERTIES

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
	private context: IChatContext;

	/** 
	 * le ROOM aperte in questa CHAT 
	 */
	public rooms: RoomTurnBase[] = [];

	/** 
	 * gli ids degli ACCOUNT ONLINE partecipanti 
	 * cioe' quelli che devono essere aggiornati
	 */
	private usersIds: Set<string> = new Set();

	//#endregion



	//#region ROOM MANAGEMENT

	/**
	 * Recupera la MAIN-ROOM della CHAT  
	 * Quella con il parent a null
	 */
	private getMainRoom(): RoomTurnBase {
		return this.rooms.find(room => room.room.parentRoomId == null)
	}

	/**
	 * Recupera una ROOM dalla CHAT
	 */
	public getRoomById(id?: string): RoomTurnBase {
		if (!id || !this.rooms) return null
		return this.rooms.find(room => room.room.id == id)
	}

	//#endregion 



	//#region HANDLE CHAT OPERATIONS

	/**
	 * comunico alla CHAT che un CLIENT è entrato
	 * aggiungo il CLIENT in CHAT
	 */
	addUser(userId: string) {
		// se il CLIENT è già in CHAT non faccio nulla
		if (!userId || this.usersIds.has(userId)) return;

		// ricavo i dati del CLIENT
		const user = (this.context.getUserById(userId))
		if (!user) return;

		// avverto gli altri CLIENT
		const message: ClientEnteredS2C = {
			action: CHAT_ACTION_S2C.CLIENT_ENTERED,
			chatId: this.id,
			user: user,
		}
		this.sendMessage(message)

		// inserisco il CLIENT nella CHAT
		this.usersIds.add(userId);

		// invio al nuovo CLIENT i dati della CHAT
		this.sendInfo(userId)
	}

	/**
	 * comunico alla chat che un client ha lasciato la chat
	 * e lo elimino dalla CHAT
	 * @return true se la chat è vuota e può essere rimossa
	 */
	removeUser(userId: string): boolean {
		if (!userId || !this.usersIds.has(userId)) return false;

		// avverto tutti i CLIENTs
		const message: ClientLeaveS2C = {
			action: CHAT_ACTION_S2C.CLIENT_LEAVE,
			chatId: this.id,
			userId: userId,
		}
		this.sendMessage(message, [userId]) // escludo il client che lascia

		this.usersIds.delete(userId);
		return this.usersIds.size == 0
	}

	/** 
	 * aggiorno la HISTORY con una serie di MessageUpdate 
	 * Manda il messaggio di aggiornamento a tutti i partecipanti alla CHAT
	 */
	updateHistory(updates: MessageUpdate[], roomId?: string): RoomTurnBase {
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
	 * @param accountId l'ACCOUNT a cui inviare le info
	 */
	private sendInfo(accountId:string) {

		const clients: AccountDTO[] = [...this.usersIds].map(clientId => {
			return this.context.getUserById(clientId)
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

		this.context.sendMessageToUser(accountId, msg)
	}

	/**
	 * Invia a tutti i partecipanti della CHAT un MESSAGE
	 */
	private sendMessage(message: BaseS2C, esclude: string[] = []): void {
		for (const userId of this.usersIds) {
			if (esclude.includes(userId)) continue;
			this.context.sendMessageToUser(userId, message)
		}
	}

	//#endregion



	//#region CHAT PROCESSING

	/**
	 * Indico alla CHAT che una ROOM deve essere "completata"
	 */
	async complete(): Promise<LlmResponse> {
		// [II] assumo che da completare sia sempre la MAIN-ROOM
		let room: RoomTurnBase = this.getMainRoom()
		return await this.recursiveRequest(room)
	}

	/**
	 * Effettua una richiesta loop su una ROOM 
	 */
	private async recursiveRequest(room: RoomTurnBase): Promise<LlmResponse> {

		const handlers: IRoomHandlers = {
			onTool: async (toolId: string, args: any) => {
				return this.context.executeTool(toolId, args)
			},
			onSubAgent: async (requestAgentId, responseAgentId, question) => {

				// recupero il sub-agente dal DB
				const agentRepo: AgentRepo = await this.context.getAgentRepoById(responseAgentId)
				if (!agentRepo) return null;

				// creo una nuova room per il sub-agente
				const subRoom = RoomTurnBase.Build(this.id, [agentRepo], this.accountId, room.room.id)
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

				// inserisco messaggio "user" ma dell'AGENT nella nuova ROOM
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
			},
			onMessage: (chatMessage: ChatMessage, roomId: string) => {
				const msgUpd: MessageUpdate = {
					type: UPDATE_TYPE.APPEND,
					content: chatMessage,
				}
				this.updateHistory([msgUpd], roomId);
			},
			onBuildAgent: async (agentRepo: AgentRepo) => new AgentLlm(agentRepo),
		}

		const conversation = new RoomConversationManager(room.room, handlers)
		return await conversation.getResponse()
	}

	//#endregion

}

export default ChatNode