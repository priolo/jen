import { ChatsWSService } from "@/routers/ChatsWSRoute.js"
import ChatNode from "./ChatNode.js"
import { RoomRepo } from "@/repository/Room.js"
import { REPO_PATHS } from "@/config.js"
import { Bus, typeorm } from "@priolo/julian"
import { FindManyOptions } from "typeorm"
import { ChatRepo } from "@/repository/Chat.js"



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
		for (const room of chatRepo.rooms) {
			await this.saveRoom(room)
		}
	}
	private async saveRoom(room: RoomRepo): Promise<void> {
		await new Bus(this.service, REPO_PATHS.ROOMS).dispatch({
			type: typeorm.Actions.SAVE,
			payload: <RoomRepo>{
				id: room.id,
				chatId: room.chatId,
				accountId: room.accountId,
				history: room.history ?? [],
				parentRoomId: room.parentRoomId,
				agents: room.agents ?? [],
			}
		})
	}

	async loadChatById(chatId: string): Promise<ChatNode> {
		// carico la CHAT
		const chatRepo: ChatRepo = await new Bus(this.service, REPO_PATHS.CHATS).dispatch({
			type: typeorm.Actions.GET_BY_ID,
			payload: chatId
		})
		if (!chatRepo) throw new Error(`Chat not found: ${chatId}`)

		// carico tutte le ROOMs di quella CHAT
		const roomsRepo: RoomRepo[] = await new Bus(this.service, REPO_PATHS.ROOMS).dispatch({
			type: typeorm.Actions.FIND,
			payload: <FindManyOptions<RoomRepo>>{
				where: {
					chatId: chatId
				}
			}
		})

		chatRepo.rooms = roomsRepo

		// Creo la CHAT con le ROOMs caricate
		const chat = await ChatNode.Build(this.service.chatContext, chatRepo)
		return chat
	}

}