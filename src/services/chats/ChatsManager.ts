import { REPO_PATHS } from "@/config.js"
import { ChatRepo } from "@/repository/Chat.js"
import { ChatsWSService } from "@/routers/ChatsWSRoute.js"
import { Bus, typeorm } from "@priolo/julian"
import { FindOneOptions } from "typeorm"
import ChatProxy from "./ChatProxy.js"


/**
 * Contiene tutte le CHATs attive nel sistema
 */
export class ChatsManager {

	constructor(
		private service: ChatsWSService = null,
	) { }

	/**
	 * Le CHATs attive nel sistema
	 */
	private chats: ChatProxy[] = []
	/**
	 * Restituisce tutte le CHATs attive
	 */
	getChats(): ChatProxy[] {
		return this.chats
	}

	/**
	 * Restituisce la CHAT specificata
	 */
	getChatById(chatId: string): ChatProxy | undefined {
		return this.chats.find(chat => chat.chatRepo.id === chatId)
	}

	/**
	 * Inizia una SESSION di una CHAT
	 */
	addChat(chat: ChatProxy): void {
		this.chats.push(chat)
	}

	/**
	 * Termina una SESSION di una CHAT
	 */
	removeChat(chatId: string): void {
		const index = this.chats.findIndex(c => c.chatRepo.id === chatId)
		if (index == -1) throw new Error(`Chat not found: ${chatId}`)
		this.chats.splice(index, 1);
	}



	/** 
	 * Salvo la CHAT sul DB 
	 */
	async saveChat(chatRepo: ChatRepo): Promise<void> {
		if (!chatRepo) return;
		await new Bus(this.service, REPO_PATHS.CHATS).dispatch({
			type: typeorm.Actions.SAVE,
			payload: chatRepo,
		})
	}

	/**
	 * Salvo le ROOMs della CHAT sul DB
	 */
	async saveChatRooms(chatRepo: ChatRepo): Promise<void> {
		if (!chatRepo) return;
		for (const room of chatRepo.rooms ?? []) {
			await new Bus(this.service, REPO_PATHS.ROOMS).dispatch({
				type: typeorm.Actions.SAVE,
				payload: room,
			})
		}
	}

	/**
	 * Cerco la chat in MEM se non la trovo la carico dal DB
	 */
	async loadChatById(chatId: string): Promise<ChatProxy> {
		// cerco la CHAT che contiene la ROOM
		let chat = this.getChatById(chatId)

		// non la trovo in memoria quindi carico tutta la CHAT dal DB
		if (!chat) {

			// carico la CHAT specificando le relazioni da includere (users e rooms)
			const chatRepo: ChatRepo = await new Bus(this.service, REPO_PATHS.CHATS).dispatch({
				type: typeorm.Actions.FIND_ONE,
				payload: <FindOneOptions<ChatRepo>>{
					where: { id: chatId },
					relations: {
						users: true,
						rooms: true,
					}
				}
			})

			// Creo la CHAT con le ROOMs caricate
			chat = ChatProxy.Build(this.service, chatRepo)
			this.service.chatManager.addChat(chat)
		}

		if (!chat) throw new Error(`Chat not found: ${chatId}`)
		return chat
	}

}