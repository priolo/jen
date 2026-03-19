import { AccountDTO } from "@shared/types/AccountDTO.js"
import { ChatDTO } from "@shared/types/ChatDTO.js"
import { JsonCommand, TYPE_JSON_COMMAND } from "@shared/update.js"
import { ProxyServer } from "./ProxyServer.js"




export class ChatsProxy extends ProxyServer<ChatDTO> {


	/**
	 * Recupera uno USER partecipante alla CHAT
	 * non necessariamente ONLINE
	 */
	public getPartecipantById(chatId: string, userId: string): AccountDTO {
		return this.get(chatId)?.users.find(user => user.id == userId)
	}

	/**
	 * Restituisce gli USER ONLINE partecipanti alla CHAT
	 */
	public getOnlineUserIds(chatId: string, userId: string): string[] {
		return this.get(chatId)?.onlineUserIds
	}

	/**
	 * Un utente si disconnette e quindi lo elimino da tutte la CHATs in cui è presente
	 */
	public removeUserOnline(userId: string) {
		const chats = this.getAll()
		for (const chat of chats) {
			this.removeUser(chat.id, userId)
		}
	}

	/**
	 * un utente esce da una specifica CHAT
	 */
	public removeUser(chatId: string, userId: string) {
		const chat = this.get(chatId)
		if (!chat?.onlineUserIds?.includes(userId)) return

		const jsonCmm: JsonCommand = {
			type: TYPE_JSON_COMMAND.DELETE,
			path: "onlineUserIds",
			value: userId
		}
		this.updateCommands(chat.id, [jsonCmm])

		// se non ci sono più utenti online, rimuovo la chat dalla cache
		if (chat.onlineUserIds.length == 0) {
			this.removeItem(chat.id)
		}
	}

	public addUser(chatId: string, userId: string) {
		const chat = this.get(chatId)
		if (chat?.onlineUserIds?.includes(userId)) return

		const jsonCmm: JsonCommand = {
			type: TYPE_JSON_COMMAND.MERGE,
			path: "onlineUserIds",
			value: userId
		}
		this.updateCommands(chat.id, [jsonCmm])

	}

	//#region ProxyService OVERRIDE

	override removeItem(id: string) {
		const chat = this.get(id)
		if ( !chat ) return false
		
		for ( const room in chat.rooms ) {
			this.service.roomsProxy.remove(room.id)
		}

		this.service.chatManager.saveChat(chat)
		return super.removeItem(id)
	}

	//#endregion
}