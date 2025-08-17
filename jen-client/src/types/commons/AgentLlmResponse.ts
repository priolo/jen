import { ChatMessage } from "./RoomActions";

export enum LLM_RESPONSE_TYPE {
	/** risposta finale */
	COMPLETED,
	/** continua a ragionare */
	UNKNOWN,
	/** non sa rispondere */
	FAILURE,

	/** chiamata ad un tool */
	TOOL,
	/** richiesta di nuove informazioni ad un agente*/
	ASK_TO,

	/** aggiorna la strategia da seguire */
	STRATEGY,
	/** continua a ragionare (loop) */
	REASONING
}

export interface LlmResponse {
	type: LLM_RESPONSE_TYPE
	// la risposta di "vercel-ai" da aggiungere alla history
	responseRaw: ChatMessage[]
	// se non è la risposta finale
	continue?: boolean

	// dipende dal type
	content?: ContentCompleted | ContentAskTo | ContentTool  | ContentStrategy | ContentReasoning
}

export interface ContentCompleted {
	answer: string;
}

export interface ContentAskTo {
	agentId: string
	// la domanda porre all'agent
	question: string
	// risposta dell'agent
	result?: any
}


export interface ContentTool {
	toolId: string;
	// il nome del tool
	//name: string;
	// i parametri da passare al tool
	args: any
	// risposta del tool
	result?: any
}

export interface ContentStrategy {
	strategy: string;
}

export interface ContentReasoning {
	thought: string;
}
