import { AgentRepo } from "@/repository/Agent.js";
import { AccountDTO } from "@/types/account.js";
import { BaseS2C } from "@/types/commons/RoomActions.js";



/**
 * Astrazione per la gestione
 * - comunicazione
 * - risorse (tool, agent, account)
 */
export interface IChatContext {
	/**
	 * Esegue un TOOL e ne restituisce il risultato
	 */
	executeTool: (toolId: string, args: any) => Promise<any>
	/**
	 * Restitui un AGENT pronto per l'uso
	 */
	getAgentRepoById: (agentId: string) => Promise<AgentRepo>
	/**
	 * Restituisce l'ACCOUNT ONLINE associato ad un CLIENT
	 */
	getUserById(clientId: string): AccountDTO

	/**
	 * Costruisce un istanza di ROOM 
	 * usata dagli AGENTs per creare uno spazio di conversazione
	 */
	//buildRoom(room: RoomRepo): RoomTurnBased

	/**
	 * Invia un messaggio ad un ACCOUNT online specifico
	 */
	sendMessageToUser: (accountId: string, message: BaseS2C) => void
}
