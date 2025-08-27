

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
	// la risposta RAW da aggiungere alla history
	responseRaw: any[]
	// se non è la risposta finale
	continue?: boolean

	// dipende dal type
	content?: ContentCompleted | ContentAskTo | ContentTool  | ContentStrategy | ContentReasoning | ContentFailure
}

export interface ContentCompleted {
	answer: string;
}
export interface ContentStrategy {
	strategy: string;
}
export interface ContentReasoning {
	thought: string;
}
export interface ContentFailure {
	reason: string;
}


export interface ContentAskTo {
	agentId: string
	// la domanda porre all'agent
	question: string
	// risposta dell'agent
	result?: any
}


export interface ContentTool {
	/** id del tool */
	toolId: string;
	/** se disponibile metto anche il nome */
	toolName?: string;
	// i parametri da passare al tool
	args: any
	// risposta del tool
	result?: any
}

