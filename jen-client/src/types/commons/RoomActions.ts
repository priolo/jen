import { LlmResponse } from "./LlmResponse.js";


/**
 * Un messaggio di chat (compone la HISTORY di una ROOM)
 */
export type ChatMessage = {
	/** identificativo del MESSAGE */
	id?: string;
	/** identifica di chi è il messaggio. Se null è l'utente principale */
	authorId?: string
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
	roomId: string
	text: string
}

//#endregion




//#region SERVER TO CLIENT

export enum CHAT_ACTION_S2C {
	ENTERED = "entered",
	LEAVE = "leave",
	MESSAGE = "message",
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

/** è stato inserito un MESSAGE in ROOM  */
export type MessageS2C = BaseS2C & {
	action: CHAT_ACTION_S2C.MESSAGE
	/** la stanza in cui è stato inserito */
	roomId: string
	/** il conenuto del messaggio */
	content: ChatMessage
}



/** è stata creata una SUB-ROOM */
export type NewRoomS2C = BaseS2C & {
	action: CHAT_ACTION_S2C.NEW_ROOM

	roomId: string
	parentRoomId?: string
	agentId?: string
}

//#endregion