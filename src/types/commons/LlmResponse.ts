

export enum LLM_RESPONSE_TYPE {
	/** 0 risposta finale */
	COMPLETED,
	/** 1 continua a ragionare */
	UNKNOWN,
	/** 2 non sa rispondere */
	FAILURE,

	/** 3 chiamata ad un tool */
	TOOL,
	/** 4 richiesta di nuove informazioni ad un agente*/
	ASK_TO,

	/** 5 aggiorna la strategia da seguire */
	STRATEGY,
	/** 6 continua a ragionare (loop) */
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
	/**  la SUB-ROOM usata */
	roomId?: string;
	/** id dell'AGENT a cui è stata fatta la domanda */
	agentId: string
	/** la domanda posta all'AGENT */
	question: string
	/** risposta dell'AGENT */
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

