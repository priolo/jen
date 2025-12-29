import { AgentLlm } from "./Agent";



export interface Llm {
	id?: string;

	/**
	 * Nome del modello (es: gpt-3.5-turbo, gpt-4, ...)
	 */
	code?: string;

	/**
	 * l'API KEY
	 */
	key?: string;

	/**
	 * Agents that use this LLM
	 */
	agents?: AgentLlm[];

}

