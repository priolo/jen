import { AgentRepo } from "@/repository/Agent.js";
import { RoomRepo } from "@/repository/Room.js";
import { AccountDTO } from "@/types/account.js";
import { BaseS2C } from "@/types/commons/RoomActions.js";
import RoomTurnBased from "./RoomTurnBased.js";



/**
 * Astrazione per la gestione
 * - comunicazione
 * - risorse (tool, agent, account)
 */
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
	 * Restituisce l'ACCOUNT ONLINE associato ad un CLIENT
	 */
	getAccountById(clientId: string): AccountDTO

	/**
	 * Costruisce un istanza di ROOM 
	 * usata dagli AGENTs per creare uno spazio di conversazione
	 */
	//buildRoom(room: RoomRepo): RoomTurnBased

	/**
	 * Invia un messaggio ad un client specifico
	 */
	sendMessageToClient: (clientId: string, message: BaseS2C) => void
}
