import { LlmResponse } from "./LlmResponse.js";


/**
 * Un messaggio di chat (compone la HISTORY di una ROOM)
 */
export type ChatMessage = {
	/** identificativo del MESSAGE */
	id: string;
	/** identifica di chi è il messaggio. Se null è l'utente principale */
	clientId?: string
	/** se valorizzato il MESSAGE è collegato ad una ROOM */
	subRoomId?: string;
	/** il ruolo di chi ha scritto il messaggio */
	role: "user" | "agent" | "system"
	/** il testo del messaggio (oppure la risposta LLM) */
	content: string | LlmResponse
}

/**
 * E' uno spazio dotato di HISTORY dove i CLIENT possono comunicare
 */
export type ChatRoom = {
	id: string
	parentRoomId?: string
	history: ChatMessage[]
	agentsIds: string[]
}




//#region CLIENT TO SERVER

export enum CHAT_ACTION_C2S {
	/* un CLIENT crea e entra in una CHAT */
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
	// in futuro si potranno creare diversi tipi di CHAT
	// type: "single-agent" | "free" | "agile" | "document" 
	/** LLM-AGENT di riferimento */
	agentId: string
}

/** CLIENT lascia la CHAT */
export type UserLeaveC2S = BaseC2S & {
	action: CHAT_ACTION_C2S.LEAVE
	/** il client che fa l'azione */
	clientId: string
}

/** un CLIENT inserisce un messaggio */
export type UserMessageC2S = BaseC2S & {
	action: CHAT_ACTION_C2S.USER_MESSAGE
	/** id della ROOM, se null è la MAIN-ROOM */
	roomId?: string
	/** il testo del messaggio */
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

/** un CLIENT è entrato in una CHAT */
export type UserEnteredS2C = BaseS2C & {
	action: CHAT_ACTION_S2C.ENTERED
	rooms: ChatRoom[]
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



/** creata una nuova SUB-ROOM */
export type RoomNewS2C = BaseS2C & {
	action: CHAT_ACTION_S2C.ROOM_NEW
	/** id nella nuova ROOM */
	roomId: string
	/** id della PARENT-ROOM  */
	parentRoomId: string
	/** LLM-AGENT di riferimento */
	agentId: string
}

//#endregion