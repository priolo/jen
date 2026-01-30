import { AgentRepo } from "@/repository/Agent.js"
import { ChatRepo } from "@/repository/Chat.js"
import { BuildRoomRepo } from "@/repository/Room.js"
import { ChatsWSService } from "@/routers/ChatsWSRoute.js"
import { CHAT_ACTION_C2S, ChatCreateC2S, ChatGetC2S, RoomAgentsUpdateC2S, RoomHistoryUpdateC2S, UserInviteC2S, UserLeaveC2S, UserRemoveC2S } from "@shared/types/ChatActionsClient.js"
import { UPDATE_TYPE } from "@shared/types/ChatMessage.js"
import ChatNode from "./ChatNode.js"
import { ChatProcessor } from "./ChatProcessor.js"
import { AccountDTO } from "@shared/types/account.js"


/**
 * Gestisce i messaggi che arrivano dal CLIENT
 */
export class ChatsMessages {

	constructor(
		private service: ChatsWSService = null,
	) { }

	/**
	 * Handle incoming WebSocket messages
	 * [II] forse bisogna togliere gli await, ma per ora lascio così
	 */
	async onMessage(user: AccountDTO, msg: any) {
		if (!user || !msg) return

		if (msg.action === CHAT_ACTION_C2S.CHAT_CREATE_AND_ENTER) {
			await this.handleChatCreate(user, msg as ChatCreateC2S)
			return
		}
		if (msg.action === CHAT_ACTION_C2S.CHAT_LOAD_AND_ENTER) {
			await this.handleChatLoad(user, msg as ChatGetC2S)
			return
		}

		// messaggi che necessitano di una CHAT esistente
		const chat = this.service.chatManager.getChatById(msg.chatId)
		if (!chat) throw new Error(`Chat not found: ${msg.chatId}`)

		switch (msg.action) {

			case CHAT_ACTION_C2S.USER_LEAVE:
				await this.handleUserLeave(user, msg as UserLeaveC2S)
				break

			case CHAT_ACTION_C2S.USER_INVITE:
				await this.handleUserInvite(user, msg as UserInviteC2S)
				break

			case CHAT_ACTION_C2S.USER_REMOVE:
				await this.handleUserRemove(user, msg as UserRemoveC2S)
				break

			case CHAT_ACTION_C2S.ROOM_AGENTS_UPDATE: {
				const msgUp: RoomAgentsUpdateC2S = msg
				await chat.updateAgents(msgUp.agentsIds, msgUp.roomId)
				break
			}

			case CHAT_ACTION_C2S.ROOM_HISTORY_UPDATE: {
				const msgUp: RoomHistoryUpdateC2S = msg
				const room = chat.updateHistory(msgUp.updates, msgUp.roomId)
				if (room.agents?.length > 0 && msgUp.updates.some(u => u.content.role == "user" && u.type == UPDATE_TYPE.ADD)) {
					await (new ChatProcessor(this.service)).complete(chat, chat.getMainRoom());
				}
				break
			}
		}
	}

	/**
	 * Crea una nuova CHAT.  
	 * crea la MAIN-ROOM
	 * carica gli AGENTs specificati
	 * Inserisce il CLIENT che l'ha creata
	 */
	private async handleChatCreate(user: AccountDTO, msg: ChatCreateC2S) {
		const userId = user?.id
		if (!userId) throw new Error(`Invalid userId`)

		// carico gli agenti REPO
		const agentsRepo = (await Promise.all(
			(msg.agentIds ?? []).map(id => this.service.chatContext.getAgentRepoById(id))
		)).filter(agent => !!agent) as AgentRepo[]

		// creao la ROOM principale
		const room = BuildRoomRepo(msg.chatId, agentsRepo, userId)

		// creo la CHAT
		const chatRepo: ChatRepo = {
			id: msg.chatId,
			mainRoomId: room.id,
			accountId: userId,
			rooms: [room],
			users: [{ id: userId }],
		}
		const chat = await ChatNode.Build(this.service, chatRepo)

		// inserisco la CHAT nel MANAGER e faccio entrare il CLIENT
		this.service.chatManager.addChat(chat)
		chat.addUser(userId)
	}

	/**
	 * Ottiene la CHAT specificata  
	 * Se non la trova in meme la carica dal DB  
	 * Inserisce il CLIENT nella CHAT  
	 * Invia le info della CHAT al CLIENT  
	 */
	private async handleChatLoad(user: AccountDTO, msg: ChatGetC2S) {
		const userId = user?.id
		if (!userId) throw new Error(`Invalid userId`)

		// cerco la CHAT che contiene la ROOM
		let chat = this.service.chatManager.getChatById(msg.chatId)

		// non la trovo in memoria quindi carico tutta la CHAT dal DB
		if (!chat) {
			chat = await this.service.chatManager.loadChatById(msg.chatId)
			this.service.chatManager.addChat(chat)
		}

		// inserisco lo USER tra gli ONLINE
		chat.addUser(userId)
		// inserisco lo USER tra i PARTECIPANTI
		chat.addParticipant(userId)
	}

	/**
	 * Un CLIENT lascia una CHAT
	 * Avverte tutti i partecipanti
	 * Se la CHAT è vuota la elimina
	 */
	async handleUserLeave(user: AccountDTO, msg: UserLeaveC2S) {
		const userId = user?.id
		if (!userId) throw new Error(`Invalid userId`)
		const chat = this.service.chatManager.getChatById(msg.chatId)
		if (!chat) throw new Error(`Chat not found: ${msg.chatId}`)

		const isVoid = chat.removeUser(userId)
		if (isVoid) {
			this.service.chatManager.removeChat(chat.chatRepo.id)
			await this.service.chatManager.saveChat(chat.chatRepo)
			await this.service.chatManager.saveChatRooms(chat.chatRepo)
		}
	}

	/**
	 * Un CLIENT lascia una CHAT
	 * Avverte tutti i partecipanti
	 * Se la CHAT è vuota la elimina
	 */
	private async handleUserInvite(user: AccountDTO, msg: UserInviteC2S) {
		const userId = user?.id
		if (!userId) throw new Error(`Invalid userId`)
		const chat = this.service.chatManager.getChatById(msg.chatId)
		if (!chat) throw new Error(`Chat not found: ${msg.chatId}`)
		const invitedUserId = msg.userId
		if (!invitedUserId) throw new Error(`Invalid invited userId`)
		//if ( this.getClientById(invitedUserId) ) return; // già presente

		// inserisco uno USER negli ONLINE della CHAT e avverto tutti
		chat.addUser(invitedUserId)
		// inserisco lo USER tra i PARTECIPANTI
		chat.addParticipant(invitedUserId)
	}

	/**
	 * Rimuove un UTENTE dalla chat
	 * - rimuove dai partecipanti nel db
	 * - rimuove l'utente (se online) dalla chat
	 * - avverte tutti (tranne l'utente rimosso) che l'utente è uscito
	 */
	private async handleUserRemove(user: AccountDTO, msg: UserRemoveC2S) {
		const chat = this.service.chatManager.getChatById(msg.chatId)
		if (!chat) throw new Error(`Chat not found: ${msg.chatId}`)

		// rimuovo dal DB
		chat.removeParticipant(msg.userId)
		await this.service.chatManager.saveChat(chat.chatRepo)

		// rimuovo dalla sessione (se presente) e notifico (CLIENT_LEAVE)
		chat.removeUser(msg.userId)
	}

	//#endregion 

}