import { REPO_PATHS } from "@/config.js"
import { ChatsContext } from "@/services/chats/ChatsContext.js"
import { ChatsManager } from "@/services/chats/ChatsManager.js"
import { ChatsMessages } from "@/services/chats/ChatsMessage.js"
import { ChatsSend } from "@/services/chats/ChatsSend.js"
import { ACCOUNT_STATUS, GetAccountDTO } from '@/types/account.js'
import { Bus, typeorm, ws } from "@priolo/julian"
import { AccountDTO } from "@shared/types/account.js"
import { CHAT_ACTION_C2S, UserLeaveC2S } from "@shared/types/RoomActions.js"



export type ChatsWSConf = Partial<ChatsWSService['stateDefault']>

/**
 * GLOBAL: WebSocket service for managing prompt chat rooms
 * Contiene le CHAT-ROOMS ognuna di queste composta da piu' ROOMS e CLIENTs
 * in pratica è un servizio di CHAT multi-room e multi-agente 
 * gestisce prevalentemente i messaggi
 */
export class ChatsWSService extends ws.route {

	chatManager: ChatsManager = new ChatsManager(this)
	chatMessages: ChatsMessages = new ChatsMessages(this)
	chatSend: ChatsSend = new ChatsSend(this)
	chatContext: ChatsContext = new ChatsContext(this)

	get stateDefault() {
		return {
			...super.stateDefault,
			name: "ws-chats",
		}
	}
	declare state: typeof this.stateDefault



	async onConnect(client: ws.IClient) {
		const userId = client.jwtPayload?.id

		// aggiorno i dati del ACCOUNT
		let account = this.chatSend.getUserOnlineById(userId) as AccountDTO
		if (!account) {
			const accountRepo = await new Bus(this, REPO_PATHS.ACCOUNTS).dispatch({
				type: typeorm.Actions.GET_BY_ID,
				payload: userId
			})
			if (!accountRepo) throw new Error(`Account not found: ${userId}`)
			account = GetAccountDTO(accountRepo)
		}
		client.jwtPayload = {
			...client.jwtPayload,
			...account,
			status: ACCOUNT_STATUS.ONLINE,
		}

		super.onConnect(client)
	}

	async onDisconnect(client: ws.IClient) {
		const user = client.jwtPayload as AccountDTO

		// Se ci sono altri USER connessi con lo stesso ID, non faccio nulla
		const clients = this.getClients()?.filter(c => c?.jwtPayload?.id == user.id)
		if ( clients && clients.length > 0 ) {
			return super.onDisconnect(client)
		}

		// rimuovo il client da tutte le CHATs
		const chats = this.chatManager.getChats()
		for (const chat of chats) {
			await this.chatMessages.handleUserLeave(
				user,
				<UserLeaveC2S>{ 
					action: CHAT_ACTION_C2S.USER_LEAVE, 
					chatId: chat.chatRepo.id 
				}
			)
		}
		super.onDisconnect(client)
	}

	/**
	 * Handle incoming WebSocket messages
	 * [II] forse bisogna togliere gli await, ma per ora lascio così
	 */
	async onMessage(client: ws.IClient, message: string) {
		const user = client?.jwtPayload as AccountDTO
		let msg = JSON.parse(message)
		await this.chatMessages.onMessage(user, msg)
	}

}


