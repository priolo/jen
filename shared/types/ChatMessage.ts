import { LlmResponse } from "./LlmResponse.js";


/**
 * Un messaggio di chat (compone la HISTORY di una ROOM)
 */
export type ChatMessage = {
	/** identificativo del MESSAGE */
	id?: string;
	/** identifica di chi è il messaggio. Se null è l'utente principale */
	clientId?: string
	/** il ruolo di chi ha scritto il messaggio */
	role: "user" | "agent" | "system"
	/** il testo del messaggio (oppure la risposta LLM) */
	content: string | LlmResponse
}

/**
 * Contiene le info per l'aggiornamento di un messaggio nella history
 */
export type MessageUpdate = {
	/** il messaggio di riferimento per la posizione */
	refId?: string
	/** tipo di aggiornamento */
	type: UPDATE_TYPE
	/** nuovo testo del messaggio */
	content: ChatMessage
}

export enum UPDATE_TYPE {
	/** inserisce un nuovo messaggio DOPO messageIdRef (=null all'inizio)*/
	ADD = "add",
	/** inserisce un nuovo messaggio alla fine (messageIdRef è ignorato) */
	APPEND = "append",
	/** sostituisce il contenuto del messaggio */
	REPLACE = "replace",
	/** elimina il messaggio messageIdRef */
	DELETE = "delete",
}
