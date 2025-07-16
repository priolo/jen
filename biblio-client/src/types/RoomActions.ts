import { CoreMessage } from "ai"



export type ChatMessage = {
	id?: string;
	subroomId?: string;
} & CoreMessage;


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

/** un CLIENT entra nella CHAT */
export type UserEnterC2S = BaseC2S & {
	action: CHAT_ACTION_C2S.ENTER
	roomId?: string
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
	APPEND_MESSAGE = "append-message",
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

/** è stato inserito un messaggio in ROOM */
export type AppendMessageS2C = BaseS2C & {
	action: CHAT_ACTION_S2C.APPEND_MESSAGE
	roomId: string
	content: ChatMessage[]
}

/** è stata creara una SUB-ROOM */
export type NewRoomS2C = BaseS2C & {
	action: CHAT_ACTION_S2C.NEW_ROOM

	roomId: string
	parentRoomId?: string
	parentMessageId?: string
	agentId?: string
}

//#endregion