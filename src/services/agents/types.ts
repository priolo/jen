import { ChatMessage } from '@/types/RoomActions.js';


export enum RESPONSE_TYPE {
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

export interface Response {
	type: RESPONSE_TYPE;
	// da aggiungere alla history
	response: ChatMessage[];
	// se non è la risposta finale
	continue?: boolean;

	// dipende dal type
	content?: ContentCompleted | ContentAskTo | ContentTool  | ContentStrategy | ContentReasoning;
}

export interface ContentCompleted {
	answer: string;
}

export interface ContentAskTo {
	question: string;
	agentId: string;
}


export interface ContentTool {
	id: string;
	// il nome del tool
	name: string;
	// i parametri da passare al tool
	args: any;
}
export interface ContentStrategy {
	strategy: string;
}
export interface ContentReasoning {
	thought: string;
}
