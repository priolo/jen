import { AgentRepo } from "../../repository/Agent.js"
import { RoomRepo } from "../../repository/Room.js"
import { BaseS2C } from "../../types/commons/RoomActions.js"


/**
 * Interfaccia del contesto a disposizione di una CHAT
 * permette di collegare la CHAT node WSRoomsService
 * La CHAT puo' solo chiedere risorse o inviare messaggi 
 */
interface ChatContext {

	/** 
	 * Crea una nuova ROOM 
	 * Indica gli AGENTS da inserire e eventualmente la PARENT-ROOM
	 */
	createRoomRepo(agents?: AgentRepo[], parentId?: string): Promise<RoomRepo | null>

	/** 
	 * Restituisce i dati dell'AGENT. 
	 * Questo deve contenere anche i SUB-AGENTS: con id, name e description
	 */
	getAgentRepoById(agentId: string): Promise<AgentRepo>

	/** Esegue un tool e restituisce il risultato */
	executeTool(toolId: string, args: any): Promise<any>

	/** Invia un messaggio ad un client */
	sendMessageToClient(clientId: string, message: BaseS2C): void

}

export default ChatContext