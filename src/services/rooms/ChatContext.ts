import { AgentRepo } from "@/repository/Agent.js";
import { BaseS2C } from "@/types/commons/RoomActions.js";


export interface ChatContext {
	/**
	 * Esegue un TOOL e ne restituisce il risultato
	 */
	executeTool: (toolId: string, args: any) => Promise<any>
	/**
	 * Restitui un AGENT pronto per l'uso
	 */
	getAgentRepoById: (agentId: string) => Promise<AgentRepo>
	/**
	 * Invia un messaggio ad un client specifico
	 */
	sendMessageToClient: (clientId: string, message: BaseS2C) => void
}
