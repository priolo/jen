import { LlmResponse } from "./LlmResponse.js";


/**
 * Un messaggio di chat (compone la HISTORY di una ROOM)
 */
export type ChatMessage = {
	/** identificativo del MESSAGE */
	id?: string;
	/** indica che questo MESSAGE apre una ROOM */
	subroomId?: string;

	role: "user" | "agent" | "system"

	content: string | LlmResponse
}





//#region CLIENT TO SERVER

export enum CHAT_ACTION_C2S {
	ENTER = "enter",
	LEAVE = "leave",
	USER_MESSAGE = "user-message",
}

export type BaseC2S = {
	action: CHAT_ACTION_C2S
	/** Rifrimento alla CHAT */
	chatId: string
}

/** un CLIENT entra nella CHAT (sempre nella ROOT-ROOM)*/
export type UserEnterC2S = BaseC2S & {
	action: CHAT_ACTION_C2S.ENTER
	agentId?: string
}

/** un CLIENT lascia la CHAT */
export type UserLeaveC2S = BaseC2S & {
	action: CHAT_ACTION_C2S.LEAVE
}

/** un CLIENT inserisce un messaggio */
export type UserMessageC2S = BaseC2S & {
	action: CHAT_ACTION_C2S.USER_MESSAGE
	text: string
	complete?: boolean
}

//#endregion




//#region SERVER TO CLIENT

export enum CHAT_ACTION_S2C {
	ENTERED = "entered",
	LEAVE = "leave",
	AGENT_MESSAGE = "agent-message",
	USER_MESSAGE = "user-message",
	NEW_ROOM = "new-room",
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

/** un AGENT ha risposto */
export type AgentMessageS2C = BaseS2C & {
	action: CHAT_ACTION_S2C.AGENT_MESSAGE
	/** la stanza in cui è stato inserito */
	roomId: string
	/** se il messaggio è stato inserito da un agente, contiene l'id dell'agente */
	agentId?: string 
	/** il conenuto del messaggio */
	content: ChatMessage
}

/** un USER ha risposto */
export type UserMessageS2C = BaseS2C & {
	action: CHAT_ACTION_S2C.USER_MESSAGE
	content: ChatMessage
}


/** è stata creara una SUB-ROOM */
export type NewRoomS2C = BaseS2C & {
	action: CHAT_ACTION_S2C.NEW_ROOM

	roomId: string
	parentRoomId?: string
	agentId?: string
}

//#endregion