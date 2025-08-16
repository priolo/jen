import { AgentRepo } from "@/repository/Agent.js"
import { RoomRepo } from "@/repository/Room.js"


interface RoomsChats {

	createRoomRepo(agents?: AgentRepo[], parentId?: string): Promise<RoomRepo | null>

	getAgentRepoById(agentId: string): Promise<AgentRepo>

	executeTool(toolId: string, args: any): Promise<any>

	/**
	 * Quando un CLIENT lascia la chat se è vuota la rimuove
	 */
	removeChat(chatId: string): void

	sendMessageToClient(clientAddress: string, message: string): void

}

export default RoomsChats