import { ChatRepo } from '@/repository/Chat.js';
import { RoomRepo } from '@/repository/Room.js';
import { AccountDTO } from '@/types/account.js';
import { AgentRepo } from "../../repository/Agent.js";
import { BaseS2C, CHAT_ACTION_S2C, ChatInfoS2C, ClientEnteredS2C, ClientLeaveS2C, MessageUpdate, RoomAgentsUpdateS2C, RoomHistoryUpdateS2C } from "@shared/types/commons/RoomActions.js";
import { RoomHistoryUpdate } from "../rooms/RoomHistory.js";
import { ChatsContext } from './ChatsContext.js';



/**
 * Gestion CHAT per quanto riguarda: 
 * CLIENTs che sono entrati nella CHAT
 * Le ROOMs create all'interno della CHAT
 */
class ChatNode {

	private constructor(
		/** 
		 * il CONTEXT per la gestione della CHAT  
		 * DEPENDENCY che si occupa della comunicazione e risorse
		 */
		private context: ChatsContext,
		/**
		 * MODEL della CHAT
		 */
		private chat: ChatRepo,
	) {
	}

	/**
	 * Creo una nuova CHAT inserendo una MAIN-ROOM
	 * @param context il CONTEXT di gestione della CHAT
	 * @param rooms le ROOMs iniziali della CHAT
	 * @param accountId l'ACCOUNT che ha creato la CHAT
	 */
	static async Build(context: ChatsContext, chatRepo: ChatRepo): Promise<ChatNode> {
		const chat = new ChatNode(context, chatRepo)
		return chat
	}



	//#region CHAT PROPERTIES

	/** 
	 * gli ids degli USERS ONLINE partecipanti 
	 * cioe' quelli che devono essere aggiornati
	 */
	private usersIds: Set<string> = new Set();

	/**
	 * l'ENTITY CHAT REPO
	 */
	public get chatRepo(): ChatRepo {
		return this.chat;
	}

	//#endregion



	//#region ROOM MANAGEMENT

	/**
	 * Recupera la MAIN-ROOM della CHAT  
	 * Quella con il parent a null
	 */
	public getMainRoom(): RoomRepo {
		return this.chat.rooms.find(room => room.parentRoomId == null)
	}

	/**
	 * Recupera una ROOM dalla CHAT
	 */
	public getRoomById(id?: string): RoomRepo {
		if (!id || !this.chat.rooms) return null
		return this.chat.rooms.find(room => room.id == id)
	}

	/**
	 * Recupera uno USER partecipante alla CHAT
	 */
	public getUserById(id: string): AccountDTO {
		if (!id || !this.chat.users) return null
		return this.chat.users.find(user => user.id == id)
	}

	//#endregion 



	//#region HANDLE CHAT OPERATIONS

	/**
	 * Comunico alla CHAT che uno USER è entrato  
	 * aggiungo lo USER nei ONLINE della CHAT
	 * invio INFO CHAT allo USER entrato  
	 */
	addUser(userId: string) {
		// se lo USER è già in CHAT non faccio nulla
		if (!userId || this.usersIds.has(userId)) return;

		// ricavo i dati dello USER
		const user = (this.context.getUserById(userId))
		if (!user) return;

		// avverto gli altri USERS
		const message: ClientEnteredS2C = {
			action: CHAT_ACTION_S2C.CLIENT_ENTERED,
			chatId: this.chat.id,
			user: user,
		}
		this.sendMessage(message)

		// inserisco lo USER nella CHAT
		this.usersIds.add(userId);

		// invio al nuovo USER i dati della CHAT
		this.sendInfo(userId)

		// aggiungo lo USER ai partecipanti della CHAT
		if (!this.getUserById(userId)) {
			this.chat.users.push({ id: userId })
		}
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
			chatId: this.chat.id,
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
	updateHistory(updates: MessageUpdate[], roomId?: string): RoomRepo {
		const room = this.getRoomById(roomId) ?? this.getMainRoom()
		if (!room) throw new Error("Room not found")

		RoomHistoryUpdate(room, updates);

		// avviso tutti i partecipanti
		const msg: RoomHistoryUpdateS2C = {
			action: CHAT_ACTION_S2C.ROOM_HISTORY_UPDATE,
			chatId: this.chat.id,
			roomId: room.id,
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
		room.agents = agents

		// avviso tutti i partecipanti
		const msg: RoomAgentsUpdateS2C = {
			action: CHAT_ACTION_S2C.ROOM_AGENTS_UPDATE,
			chatId: this.chat.id,
			roomId: room.id,
			agentsIds: agentsIds,
		}
		this.sendMessage(msg)
	}

	/**
	 * Restituisco le info della CHAT sotto forma di messaggio
	 * @param accountId l'ACCOUNT a cui inviare le info
	 */
	private sendInfo(accountId: string) {

		const clients: AccountDTO[] = [...this.usersIds].map(clientId => {
			return this.context.getUserById(clientId)
		}).filter(a => !!a)

		const rooms = this.chat.rooms.map(room => ({
			id: room.id,
			chatId: room.chatId,
			parentRoomId: room.parentRoomId,
			accountId: room.accountId,
			history: room.history,
			agentsIds: room.agents?.map(a => a.id),
		}))

		const msg: ChatInfoS2C = {
			action: CHAT_ACTION_S2C.CHAT_INFO,
			chatId: this.chat.id,
			clients,
			rooms,
		}

		this.context.sendMessageToUser(accountId, msg)
	}

	/**
	 * Invia a tutti i partecipanti della CHAT un MESSAGE
	 */
	public sendMessage(message: BaseS2C, esclude: string[] = []): void {
		for (const userId of this.usersIds) {
			if (esclude.includes(userId)) continue;
			this.context.sendMessageToUser(userId, message)
		}
	}

	//#endregion


}

export default ChatNode