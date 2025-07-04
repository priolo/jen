import { CoreMessage } from "ai"



//#region CLIENT TO SERVER

export enum ROOM_ACTION_C2S {
	ENTER = "enter",
	LEAVE = "leave",
	SETUP = "setup",
	USER_MESSAGE = "history-add",
	COMPLETE = "complete"
}

export type BaseC2S = {
	action: ROOM_ACTION_C2S
	/** ID of the room to enter */
	roomId: string
}

/** un CLIENT entra nella ROOM */
export type UserEnterC2S = BaseC2S & {
	action: ROOM_ACTION_C2S.ENTER
	setup?: RoomSetup
}

export type UserLeaveC2S = BaseC2S & {
	action: ROOM_ACTION_C2S.LEAVE
}

export type UserMessageC2S = BaseC2S & {
	action: ROOM_ACTION_C2S.USER_MESSAGE
	text: string
	complete?: boolean
}

export type CompleteC2S = BaseC2S & {
	action: ROOM_ACTION_C2S.COMPLETE
}

//#endregion

export interface RoomSetup {
	agentId?: string	
}

//#region SERVER TO CLIENT

export enum ROOM_ACTION_S2C {
	ENTERED = "entered",
	LEAVE = "leave",
	SETUP = "setup",
	APPEND_MESSAGE = "append-message"
}

export type BaseS2C = {
	action: ROOM_ACTION_S2C
	roomId: string
}

export type UserEnteredS2C = BaseS2C & {
	action: ROOM_ACTION_S2C.ENTERED
	setup: RoomSetup
}

export type UserLeaveS2C = BaseS2C & {
	action: ROOM_ACTION_S2C.LEAVE
}

export type AppendMessageS2C = {
	action: ROOM_ACTION_S2C.APPEND_MESSAGE
	roomId: string
	parentMessageId?: string
	content: CoreMessage[]
}

//#endregion