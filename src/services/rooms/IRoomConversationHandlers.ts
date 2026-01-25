import { AgentRepo } from "@/repository/Agent.js";
import { LlmResponse } from "@/types/commons/LlmResponse.js";
import { ChatMessage } from "@/types/commons/RoomActions.js";
import { IAgent } from "../agents/IAgent.js";



export interface IRoomConversationHandlers {
	/**
	 * chiamato quando bisogna avere un risultato da un tool
	 * @param id l'ID del TOOL da eseguire
	 * @param args gli ARGOMENTI da passare al TOOL
	 * @returns il RISULTATO dell'esecuzione del TOOL
	 */
	onTool?: (id: string, args: any) => Promise<any>;
	/**
	 * chiamato quando un AGENT chiede ad un SUB-AGENT una risposta
	 * @param requestAgentId l'AGENT che fa la richiesta (USER)
	 * @param responseAgentId l'AGENT che deve rispondere (SUB-AGENT)
	 * @param question la domanda da porre al SUB-AGENT
	 * @returns la risposta dell'SUB-AGENT e l'ID della ROOM creata per la conversazione
	 */
	onSubAgent?: (requestAgentId: string, responseAgentId: string, question: string) => Promise<{ response: LlmResponse; roomId: string; }>;

	/**
	 * chiamato quando un AGENT produce un messaggio
	 * @param chatMessage il messaggio prodotto
	 * @param roomId la ROOM in cui è stato prodotto il messaggio
	 */
	onMessage?: (chatMessage: ChatMessage, roomId: string) => void;

	/**
	 * chiamato per creare un'istanza di IAgent dato un AgentRepo
	 * @param agentRepo 
	 * @returns 
	 */
	onBuildAgent?: (agentRepo: AgentRepo) => Promise<IAgent>;
}
