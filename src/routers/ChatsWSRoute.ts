import { REPO_PATHS } from "@/config.js"
import { AccountDTOFromAccountRepo } from '@/repository/Account.js'
import { ChatsContext } from "@/services/chats/ChatsContext.js"
import { ChatsManager } from "@/services/chats/ChatsManager.js"
import { ChatsMessages } from "@/services/chats/ChatsMessage.js"
import { ChatsSend } from "@/services/chats/ChatsSend.js"
import { ChatsProxy } from "@shared/proxy/ChatsProxy.js"
import { RoomsProxy } from "@shared/proxy/RoomProxy.js"
import { Bus, typeorm, ws } from "@priolo/julian"
import { ACCOUNT_STATUS, AccountDTO } from '@shared/types/AccountDTO.js'
import { Message } from "apache-arrow"



export type ChatsWSConf = Partial<ChatsWSService['stateDefault']>

/**
 * GLOBAL: WebSocket service for managing prompt chat rooms
 * Contiene le CHAT-ROOMS ognuna di queste composta da piu' ROOMS e CLIENTs
 * in pratica è un servizio di CHAT multi-room e multi-agente 
 * gestisce prevalentemente i messaggi
 */
export class ChatsWSService extends ws.route {

	chatsProxy: ChatsProxy
	roomsProxy: RoomsProxy
	//chatManager: ChatsManager = new ChatsManager(this)
	chatMessages: ChatsMessages
	chatSend: ChatsSend
	chatContext: ChatsContext

	constructor(name?: string, state?: any) {
		super(name, state)

		const transport = {
			send: (listenerId: string, message: Message) => {
				const clients = this.getClients()?.filter(c => c?.id == listenerId)
				if (clients.length == 0) throw new Error(`Client not found: ${listenerId}`)
				for (const client of clients) {
					this.sendToClient(client, JSON.stringify(message))
				}
			}
		}

		this.chatsProxy = new ChatsProxy(REPO_PATHS.CHATS, transport)
		this.roomsProxy = new RoomsProxy(REPO_PATHS.ROOMS, transport)
		this.chatMessages = new ChatsMessages(this)
		this.chatSend = new ChatsSend(this)
		this.chatContext = new ChatsContext(this)
	}


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
			account = AccountDTOFromAccountRepo(accountRepo)
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
		if (clients && clients.length > 0) {
			return super.onDisconnect(client)
		}

		// rimuovo il client da tutte le CHATs
		this.chatsProxy.removeListenerInAllItems(client.id)

		super.onDisconnect(client)
	}

	/**
	 * Handle incoming WebSocket messages
	 * [II] forse bisogna togliere gli await, ma per ora lascio così
	 */
	async onMessage(client: ws.IClient, message: string) {
		const user = client?.jwtPayload as AccountDTO
		let msg = JSON.parse(message)

		//await this.chatMessages.onMessage(user, msg)
		this.chatsProxy.onMessage(msg)
		this.roomsProxy.onMessage(msg)
	}

}
