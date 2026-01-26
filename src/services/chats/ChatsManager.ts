import { REPO_PATHS } from "@/config.js"
import { ChatRepo } from "@/repository/Chat.js"
import { ChatsWSService } from "@/routers/ChatsWSRoute.js"
import { Bus, typeorm } from "@priolo/julian"
import { FindOneOptions } from "typeorm"
import ChatNode from "./ChatNode.js"



export class ChatsManager {

	constructor(
		private service: ChatsWSService = null,
	) { }


	private chats: ChatNode[] = []

	getChats(): ChatNode[] {
		return this.chats
	}

	/**
	 * Restituisce la CHAT specificata
	 */
	getChatById(chatId: string): ChatNode | undefined {
		return this.chats.find(chat => chat.chatRepo.id === chatId)
	}

	/**
	 * Inizia una SESSION di una CHAT
	 */
	addChat(chat: ChatNode): void {
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
	 * Salvo la CHAT e tutte le sue ROOMs sul DB 
	 */
	async saveChat(chatRepo: ChatRepo): Promise<void> {
		if (!chatRepo) return;
		await new Bus(this.service, REPO_PATHS.CHATS).dispatch({
			type: typeorm.Actions.SAVE,
			payload: chatRepo,
		})
		for (const room of chatRepo.rooms ?? []) {
			await new Bus(this.service, REPO_PATHS.ROOMS).dispatch({
				type: typeorm.Actions.SAVE,
				payload: room,
			})
		}
	}

	async loadChatById(chatId: string): Promise<ChatNode> {
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

        if (!chatRepo) throw new Error(`Chat not found: ${chatId}`)

        // Creo la CHAT con le ROOMs caricate
        const chat = await ChatNode.Build(this.service.chatContext, chatRepo)
        return chat
    }

}