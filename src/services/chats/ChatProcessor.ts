import { AgentRepo } from '@/repository/Agent.js';
import { BuildRoomRepo, RoomRepo } from '@/repository/Room.js';
import { ChatsWSService } from "@/routers/ChatsWSRoute.js";
import { randomUUID } from "crypto";
import { LlmResponse } from "@shared/types/commons/LlmResponse.js";
import { CHAT_ACTION_S2C, ChatMessage, MessageUpdate, RoomNewS2C, UPDATE_TYPE } from "@shared/types/commons/RoomActions.js";
import AgentLlm from '../agents/AgentLlm.js';
import { IRoomConversationHandlers } from "../rooms/IRoomConversationHandlers.js";
import { RoomConversation } from '../rooms/RoomConversation.js';
import ChatNode from './ChatNode.js';



export class ChatProcessor {

	constructor(
		private service: ChatsWSService = null,
	) { }

	/**
	 * Indico alla CHAT che una ROOM deve essere "completata"
	 */
	async complete(chat: ChatNode, room: RoomRepo): Promise<LlmResponse> {
		// [II] assumo che da completare sia sempre la MAIN-ROOM
		//let room: RoomRepo = chat.getMainRoom()
		return await this.recursiveRequest(chat, room)
	}

	/**
	 * Effettua una richiesta loop su una ROOM 
	 */
	private async recursiveRequest(chat: ChatNode, room: RoomRepo): Promise<LlmResponse> {

		const handlers: IRoomConversationHandlers = {
			onTool: async (toolId: string, args: any) => {
				return this.service.chatContext.executeTool(toolId, args)
			},
			onSubAgent: async (requestAgentId, responseAgentId, question) => {

				// recupero il sub-agente dal DB
				const agentRepo: AgentRepo = await this.service.chatContext.getAgentRepoById(responseAgentId)
				if (!agentRepo) return null;

				// creo una nuova room per il sub-agente
				const chatRepo = chat.chatRepo;
				const subRoom = BuildRoomRepo(chatRepo.id, [agentRepo], chatRepo.accountId, room.id)
				chatRepo.rooms.push(subRoom);

				// invia la nuova ROOM-AGENT al CLIENT
				const newRoomMsg: RoomNewS2C = {
					action: CHAT_ACTION_S2C.ROOM_NEW,
					chatId: chatRepo.id,
					roomId: subRoom.id,
					parentRoomId: room.id,
					agentsIds: [agentRepo.id],
				}
				chat.sendMessage(newRoomMsg)

				// inserisco messaggio "user" ma dell'AGENT nella nuova ROOM
				const msgUpd: MessageUpdate = {
					type: UPDATE_TYPE.APPEND,
					content: {
						id: randomUUID(),
						clientId: requestAgentId,
						role: "user",
						content: question,
					},
				}
				chat.updateHistory([msgUpd], subRoom.id);

				// effettuo la ricorsione su questa nuova ROOM-AGENT
				const response = await this.recursiveRequest(chat, subRoom)
				return {
					response,
					roomId: subRoom.id
				}
			},
			onMessage: (chatMessage: ChatMessage, roomId: string) => {
				const msgUpd: MessageUpdate = {
					type: UPDATE_TYPE.APPEND,
					content: chatMessage,
				}
				chat.updateHistory([msgUpd], roomId);
			},
			onBuildAgent: async (agentRepo: AgentRepo) => new AgentLlm(agentRepo),
		}

		const conversation = new RoomConversation(room, handlers)
		return await conversation.getResponseSerial()
	}
}
