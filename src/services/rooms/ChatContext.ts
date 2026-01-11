import { AgentRepo } from "@/repository/Agent.js";
import { AccountDTO, JWTPayload } from "@/types/account.js";
import { BaseS2C } from "@/types/commons/RoomActions.js";
import { ws } from "@priolo/julian"

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
	/**
	 * Restituisce l'ACCOUNT ONLINE associato ad un CLIENT
	 */
	getAccountById(clientId: string): AccountDTO

}
