import { AccountDTOFromAccountRepoList, AccountRepo } from '@/repository/Account.js';
import { RoomRepo } from '@/repository/Room.js';
import { ChatsWSService } from '@/routers/ChatsWSRoute.js';
import { AccountDTO } from '@shared/types/AccountDTO.js';
import { BaseS2C, CHAT_ACTION_S2C, ChatUpdateS2C, ChatUpdateS2C2, ClientEnteredS2C, ClientLeaveS2C, RoomAgentsUpdateS2C, RoomHistoryUpdateS2C, RoomNewS2C } from "@shared/types/ChatActionsServer.js";
import { ChatDTO } from '@shared/types/ChatDTO.js';
import { MessageUpdate } from "@shared/types/ChatMessage.js";
import { RoomDTO } from '@shared/types/RoomDTO.js';
import { applyJsonCommand, JsonCommand } from '@shared/update.js';
import { RoomHistoryUpdate } from "../rooms/RoomHistory.js";



/**
 * Gestion CHAT per quanto riguarda: 
 * CLIENTs che sono entrati nella CHAT
 * Le ROOMs create all'interno della CHAT
 */
class ChatProxy {

	private constructor(
		/** 
		 * il CONTEXT per la gestione della CHAT  
		 * DEPENDENCY che si occupa della comunicazione e risorse
		 */
		private service: ChatsWSService = null,
		/**
		 * MODEL della CHAT
		 */
		private chat: ChatDTO,
	) {
	}

	/**
	 * Creo una nuova CHAT inserendo una MAIN-ROOM
	 * @param service il CONTEXT di gestione della CHAT
	 * @param rooms le ROOMs iniziali della CHAT
	 * @param accountId l'ACCOUNT che ha creato la CHAT
	 */
	static Build(service: ChatsWSService, chatPOCO: ChatDTO): ChatProxy {
		const chat = new ChatProxy(service, chatPOCO)
		return chat
	}



	//#region CHAT PROPERTIES

	/**
	 * l'ENTITY CHAT REPO
	 */
	public get chatRepo(): ChatDTO {
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
	 * non necessariamente ONLINE
	 */
	public getPartecipantById(id: string): AccountDTO {
		if (!id || !this.chat.users) return null
		return this.chat.users.find(user => user.id == id)
	}

	//#endregion 



	//#region HANDLE CHAT OPERATIONS

	/**
	 * Comunico alla CHAT che uno USER (userId) è entrato  
	 * aggiungo lo USER nei ONLINE della CHAT
	 * invio INFO CHAT allo USER entrato  
	 */
	addUser(userId: string) {

		// se lo USER è già in CHAT non faccio nulla
		if (!userId || this.chat.onlineUserIds.includes(userId)) return;

		// cerco lo USER tra gli ONLINE. se è offline non faccio nulla
		const user = (this.service.chatSend.getUserOnlineById(userId))
		// TODO: gestire errore utente offline che entra in chat
		if (!user) return;

		// avverto gli altri USERS della CHAT
		const message: ClientEnteredS2C = {
			action: CHAT_ACTION_S2C.CLIENT_ENTERED,
			chatId: this.chat.id,
			user: user,
		}
		this.sendMessage(message)

		// inserisco lo USER tra quelli in CHAT
		this.chat.onlineUserIds.push(userId);

		// invio al nuovo USER i dati della CHAT
		const msg: ChatUpdateS2C = {
			chatId: this.chat.id,
			action: CHAT_ACTION_S2C.CHAT_UPDATE,
			chat: this.chat, 
		}
		this.service.chatSend.sendMessageToUser(userId, msg)
	}

	/**
	 * comunico alla chat che un client ha lasciato la chat
	 * e lo elimino dalla CHAT
	 * @return true se la chat è vuota e può essere rimossa
	 */
	removeUser(userId: string): boolean {
		if (!userId || !this.chat.onlineUserIds.includes(userId)) return false;

		// avverto tutti i CLIENTs
		const message: ClientLeaveS2C = {
			action: CHAT_ACTION_S2C.CLIENT_LEAVE,
			chatId: this.chat.id,
			userId: userId,
		}
		this.sendMessage(message, [userId]) // escludo il client che lascia

		this.chat.onlineUserIds = this.chat.onlineUserIds.filter(id => id !== userId)
		return this.chat.onlineUserIds.length == 0
	}


	/**
	 * Aggiungo uno USER partecipante alla CHAT
	 */
	addParticipant(user: AccountRepo) {
		if (!!this.getPartecipantById(user.id)) return

		this.chat.users.push(user)
		const msg: ChatUpdateS2C = {
			chatId: this.chat.id,
			action: CHAT_ACTION_S2C.CHAT_UPDATE,
			chat: { users: AccountDTOFromAccountRepoList(this.chat.users) },
		}
		this.sendMessage(msg)
	}

	/**
	 * Rimuovo uno USER partecipante alla CHAT
	 */
	removeParticipant(userId: string) {
		if (!this.getPartecipantById(userId)) return

		//elimino l'utente anche tra quelli online (se c'e')
		this.removeUser(userId)

		this.chat.users = this.chat.users.filter(u => u.id != userId)
		const msg: ChatUpdateS2C = {
			chatId: this.chat.id,
			action: CHAT_ACTION_S2C.CHAT_UPDATE,
			chat: { users: AccountDTOFromAccountRepoList(this.chat.users) },
		}
		this.sendMessage(msg)
	}

	/** 
	 * aggiorno la HISTORY con una serie di MessageUpdate 
	 * Manda il messaggio di aggiornamento a tutti i partecipanti alla CHAT
	 */
	updateRoomHistory(updates: MessageUpdate[], roomId?: string): RoomRepo {
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
	 * Aggiunge una nuova ROOM alla CHAT
	 */
	addRoom(room: RoomDTO) {

		this.chatRepo.rooms.push(room);
		room.chatId = this.chatRepo.id;
		if (!room.accountId) room.accountId = this.chatRepo.accountId

		// invia la nuova ROOM-AGENT al CLIENT
		const newRoomMsg: RoomNewS2C = {
			action: CHAT_ACTION_S2C.ROOM_NEW,
			chatId: this.chatRepo.id,
			roomId: room.id,
			parentRoomId: room.parentRoomId,
			agentsIds: room.agentsIds,
		}
		this.sendMessage(newRoomMsg)
	}

	/**
	 * Aggiorno la lista degli AGENTS in una ROOM della CHAT
	 */
	async updateAgents(agentsIds: string[] = [], roomId?: string): Promise<void> {
		const room = this.getRoomById(roomId) ?? this.getMainRoom()
		if (!room) return

		const agents = await Promise.all(
			agentsIds.map(agentId => this.service.chatContext.getAgentRepoById(agentId))
		)
		// const agents: AgentRepo[] = []
		// for (const agentId of agentsIds) {
		// 	const agent = await this.service.chatContext.getAgentRepoById(agentId)
		// 	if (agent) agents.push(agent)
		// }
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








	updates(commands: JsonCommand[]) {
		for (const command of commands) {
			applyJsonCommand(this.chatRepo, command)
		}
		// this.sendMessage(<ChatUpdateS2C2>{
		// 	action: CHAT_ACTION_S2C.CHAT_UPDATE2,
		// 	chatId: this.chat.id,
		// 	commands: commands,
		// })
	}
	updates2(commands: JsonCommand[]) {
		this.sendMessage(<ChatUpdateS2C2>{
			action: CHAT_ACTION_S2C.CHAT_UPDATE2,
			chatId: this.chat.id,
			commands: commands,
		})
	}


	/**
	 * Invia a tutti i partecipanti della CHAT un MESSAGE
	 */
	private sendMessage(message: BaseS2C, esclude: string[] = []): void {
		for (const userId of this.chat.onlineUserIds) {
			if (esclude.includes(userId)) continue;
			this.service.chatSend.sendMessageToUser(userId, message)
		}
	}

	//#endregion


}

export default ChatProxy