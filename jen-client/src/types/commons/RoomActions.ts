import { Uuid } from "../global.js";
import { LlmResponse } from "./LlmResponse.js";



/**
 * Un messaggio di chat (compone la HISTORY di una ROOM)
 */
export type ChatMessage = {
	/** identificativo del MESSAGE */
	id?: string;
	/** identifica di chi è il messaggio. Se null è l'utente principale */
	clientId?: string
	/** questo MESSAGE è collegato ad un altra ROOM */
	subRoomId?: string;
	/** il ruolo di chi ha scritto il messaggio */
	role: "user" | "agent" | "system"
	/** il testo del messaggio (oppure la risposta di un LLM) */
	content: string | LlmResponse
}

/**
 * E' uno spazio dotato di HISTORY dove i CLIENT possono comunicare
 */
export interface ChatRoom {
	id: Uuid;
	parentRoomId?: string;
	history: ChatMessage[];
	agentId?: Uuid;
}




//#region CLIENT TO SERVER

export enum CHAT_ACTION_C2S {
	/* un CLIENT entra nella CHAT */
	CREATE_ENTER = "create-enter",
	/* un CLIENT lascia la CHAT */
	LEAVE = "leave",
	/* un CLIENT invia un messaggio */
	USER_MESSAGE = "user-message",
}

export type BaseC2S = {
	/** tipo di action */
	action: CHAT_ACTION_C2S
	/** Rifrimento alla CHAT */
	chatId: string
}

/** CLIENT crea e entra in una nuova CHAT */
export type UserCreateEnterC2S = BaseC2S & {
	action: CHAT_ACTION_C2S.CREATE_ENTER
	/** il client che fa l'azione */
	clientId: string
	// in futuro si potranno creare diversi tipi di CHAT
	// type: "single-agent" | "free" | "agile" | "document" 
	/** agente LLM di riferimento */
	agentId?: string
}

/** un CLIENT lascia la CHAT */
export type UserLeaveC2S = BaseC2S & {
	action: CHAT_ACTION_C2S.LEAVE
	/** il client che fa l'azione */
	clientId?: string
}

/** un CLIENT inserisce un messaggio */
export type UserMessageC2S = BaseC2S & {
	action: CHAT_ACTION_C2S.USER_MESSAGE
	roomId: string
	text: string
}

//#endregion




//#region SERVER TO CLIENT

export enum CHAT_ACTION_S2C {
	ENTERED = "entered",
	LEAVE = "leave",
	MESSAGE = "message",
	ROOM_NEW = "room-new",
}

export type BaseS2C = {
	action: CHAT_ACTION_S2C
	chatId: string
}

/** un CLIENT è entrato nella CHAT */
export type UserEnteredS2C = BaseS2C & {
	action: CHAT_ACTION_S2C.ENTERED
	roomId: string
	//agentId: string
}

/** un CLIENT è uscito dalla CHAT */
export type UserLeaveS2C = BaseS2C & {
	action: CHAT_ACTION_S2C.LEAVE
}

/** è stato inserito un MESSAGE in ROOM  */
export type MessageS2C = BaseS2C & {
	action: CHAT_ACTION_S2C.MESSAGE
	/** la stanza in cui è stato inserito */
	roomId: string
	/** il conenuto del messaggio */
	content: ChatMessage
}



/** è stata creata una SUB-ROOM */
export type RoomNewS2C = BaseS2C & {
	action: CHAT_ACTION_S2C.ROOM_NEW

	roomId: string
	parentRoomId?: string
	agentId?: string
}

//#endregion