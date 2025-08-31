import { AgentRepo } from "@/repository/Agent.js"
import { RoomRepo } from "@/repository/Room.js"
import { BaseS2C } from "@/types/commons/RoomActions.js"


/**
 * Interfaccia da implementare per comunicare con una CHAT
 * permette di collegare la CHAT al REPOSITORY
 */
interface IRoomsChats {

	/** Crea una nuova ROOM */
	createRoomRepo(agents?: AgentRepo[], parentId?: string): Promise<RoomRepo | null>

	/** 
	 * Restituisce i dati dell'AGENT. Deve contenere anche
	 * SUB-AGENTS: con id, name e description
	 */
	getAgentRepoById(agentId: string): Promise<AgentRepo>

	/** Esegue un tool e restituisce il risultato */
	executeTool(toolId: string, args: any): Promise<any>

	/** Invia un messaggio ad un client */
	sendMessageToClient(clientId: string, message: BaseS2C): void

}

export default IRoomsChats