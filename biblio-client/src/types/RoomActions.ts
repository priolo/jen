import { CoreMessage } from "ai"



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
	agentId?: string
}

export type UserLeaveC2S = BaseC2S & {
	action: CHAT_ACTION_C2S.LEAVE
}

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

export type UserEnteredS2C = BaseS2C & {
	action: CHAT_ACTION_S2C.ENTERED
	roomId: string
	agentId: string
}

export type UserLeaveS2C = BaseS2C & {
	action: CHAT_ACTION_S2C.LEAVE
}

export type NewRoomS2C = BaseS2C & {
	action: CHAT_ACTION_S2C.NEW_ROOM
	roomId: string
	parentRoomId?: string
	parentMessageId?: string
}

export type AppendMessageS2C = BaseS2C & {
	action: CHAT_ACTION_S2C.APPEND_MESSAGE
	roomId: string
	content: CoreMessage[]
}

//#endregion