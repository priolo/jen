import { AgentRepo } from "@/repository/Agent.js"
import { RoomRepo } from "@/repository/Room.js"
import { BaseS2C } from "@/types/RoomActions.js"


interface RoomsChats {

	createRoomRepo(agents?: AgentRepo[], parentId?: string): Promise<RoomRepo | null>

	/** 
	 * Restituisce i dati dell'AGENT. Deve contenere anche
	 * SUB-AGENTS: con id, name e description
	 */
	getAgentRepoById(agentId: string): Promise<AgentRepo>

	executeTool(toolId: string, args: any): Promise<any>

	sendMessageToClient(clientAddress: string, message: BaseS2C): void

}

export default RoomsChats