import { Uuid } from "./global"
import { Tool } from "./Tool"



export interface Agent {
	id: Uuid
	name: string

	/** utilizzato per la descrizione all'interno dei TOOL */
	description: string
	/** prompt di system */
	systemPrompt: string
	/** prompt user di descrizione del contesto */
	contextPrompt: string

	/** se true puo' chiedere all'AGENT-PARENT (oppure all'user se è un AGENT-ROOT) informazioni */
	askInformation: boolean
	/** TRUE:
	 * una volta effettuata la risposta l'agente viene disattivato 
	 * quindi la history risulterà vuota alla prossima richiesta
	 * FALSE:
	 * La history è preservata anche per le successive domande
	*/
	killOnResponse: boolean

	/** LLM che utilizza per le risposte */
	llmDefault?: string

	/** ID dell'agente base da cui è derivato questo agente */
	baseId?: string

	/** i SUB-AGENTI che questo AGENT puo' chiamare come tools*/
	subAgents?: Partial<Agent>[]

	/** gli strumenti che questo AGENT puo' chiamare come tools */
	tools: Partial<Tool>[]
}

export enum AGENT_TYPE {
	REASONING = "REASONING",
	FINDER = "FINDER",
}



// prompt

export interface Message {
	role: string
	content: string
	timestamp: string
}
