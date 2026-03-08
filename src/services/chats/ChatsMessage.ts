import { REPO_PATHS } from "@/config.js"
import { ChatsWSService } from "@/routers/ChatsWSRoute.js"
import { Bus, typeorm } from "@priolo/julian"
import { AccountDTO } from "@shared/types/AccountDTO.js"
import { CHAT_ACTION_C2S, ChatUpdateC2S, RoomAgentsUpdateC2S, RoomHistoryUpdateC2S } from "@shared/types/ChatActionsClient.js"
import { UPDATE_TYPE } from "@shared/types/ChatMessage.js"
import { RoomDTO } from "@shared/types/RoomDTO.js"
import { matchPath } from "@shared/update.js"
import { ChatProcessor } from "./ChatProcessor.js"
import ChatProxy from "./ChatProxy.js"
import { RoomRepo } from "@/repository/Room.js"


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

		// messaggi che necessitano di una CHAT esistente
		if (!msg.chatId) throw new Error(`Invalid chatId`)
		const chat = await this.service.chatManager.loadChatById(msg.chatId)
		if (!chat) throw new Error(`Chat not found: ${msg.chatId}`)

		switch (msg.action) {

			case CHAT_ACTION_C2S.CHAT_UPDATE:
				await this.handleChatUpdate(user, chat, msg as ChatUpdateC2S)
				break

			case CHAT_ACTION_C2S.USER_ENTER:
				await this.handleUserEnter(chat, user)
				break

			case CHAT_ACTION_C2S.USER_LEAVE:
				await this.handleUserLeave(chat, user)
				break

			case CHAT_ACTION_C2S.ROOM_AGENTS_UPDATE: {
				const msgUp: RoomAgentsUpdateC2S = msg
				await chat.updateAgents(msgUp.agentsIds, msgUp.roomId)
				break
			}

			case CHAT_ACTION_C2S.ROOM_HISTORY_UPDATE: {
				const msgUp: RoomHistoryUpdateC2S = msg
				const room = chat.updateRoomHistory(msgUp.updates, msgUp.roomId)
				if (room.agents?.length > 0 && msgUp.updates.some(u => u.content.role == "user" && u.type == UPDATE_TYPE.ADD)) {
					await (new ChatProcessor(this.service)).complete(chat, chat.getMainRoom());
				}
				break
			}
		}
	}

	/**
	 * Aggiornamento generico della CHAT
	 */
	private async handleChatUpdate(user: AccountDTO, chat: ChatProxy, msg: ChatUpdateC2S) {
		const userId = user?.id
		if (!userId) throw new Error(`Invalid userId`)

		chat.updates(msg.commands)

		const buffer = new Set<string>()

		for (const cmd of msg.commands) {

			const res = matchPath(cmd.path, "rooms.*.agentsIds")
			if (res != null) {
				const roomId = res[0].id
				const room = chat.getRoomById(roomId) as RoomDTO
				await new Bus(this.service, REPO_PATHS.ROOMS).dispatch({
					type: typeorm.Actions.SAVE,
					payload: <RoomRepo>{
						id: res[0].id,
						agents: room?.agentsIds.map(agentId => ({ id: agentId })) ?? [],
					},
				})
			}
		}

		chat.updates2(msg.commands)
	}


	/**
	 * L'utente che ha inviato entra in una CHAT
	 */
	private async handleUserEnter(chat: ChatProxy, user: AccountDTO) {
		const userId = user?.id
		if (!userId) throw new Error(`Invalid userId`)
		// inserisco lo USER tra gli ONLINE
		chat.addUser(userId)
	}

	/**
	 * Un CLIENT lascia una CHAT
	 * Avverte tutti i partecipanti
	 * Se la CHAT è vuota la elimina
	 */
	async handleUserLeave(chat: ChatProxy, user: AccountDTO) {
		const userId = user?.id
		if (!userId) throw new Error(`Invalid userId`)

		const isVoid = chat.removeUser(userId)
		if (isVoid) {
			this.service.chatManager.removeChat(chat.chatRepo.id)
			await this.service.chatManager.saveChat(chat.chatRepo)
			await this.service.chatManager.saveRooms(chat.chatRepo.rooms ?? [])
		}
	}

}