import { ChatsWSService } from "@/routers/ChatsWSRoute.js"
import { ws } from "@priolo/julian"
import { AccountDTO } from "@shared/types/account.js"
import { BaseS2C } from "@shared/types/RoomActions.js"



/**
 * Gestisce l'invio di MESSAGES al CLIENT
 */
export class ChatsSend {

	constructor(
		private service: ChatsWSService = null,
	) { }

	/**
	 * Restituisce tutti i CLIENT associati ad un determinato ACCOUNT-ID
	 */
	private getClientsById(userId: string): ws.IClient[] {
		if (!userId) return null
		return this.service.getClients()?.filter(c => c?.jwtPayload?.id == userId)
	}

	/**
	 * Restituisce un ACCOUNT ONLINE
	 */
	public getUserOnlineById(userId: string): AccountDTO {
		if (!userId) return null
		return this.service.getClients()?.find(c => c?.jwtPayload?.id == userId)?.jwtPayload
	}




	public sendMessageToUser(accountId: string, message: BaseS2C) {
		const clients = this.getClientsById(accountId)
		if (clients.length == 0) throw new Error(`Client not found: ${accountId}`)
		for (const client of clients) {
			this.service.sendToClient(client, JSON.stringify(message))
		}
	}

}