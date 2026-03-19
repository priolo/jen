import { JsonCommand } from "@shared/update.js";
import { AccountDTO } from "./AccountDTO.js";
import { ChatDTO } from "./ChatDTO.js";
import { MessageUpdate, UPDATE_TYPE } from "./ChatMessage.js";




export enum ACTION_TYPE_S2C {
	UPDATE = "update",
}


export type ActionS2C = {
	entity: string
	type: ACTION_TYPE_S2C
}

export type UpdateS2C = ActionS2C & {
	type: ACTION_TYPE_S2C.UPDATE
	commands: JsonCommand[]
}


//#region CLIENT

/** 
 * aggiorno la CHAT
 * */
// export type ChatUpdateS2C = BaseS2C & {
// 	action: CHAT_ACTION_S2C.CHAT_UPDATE
// 	type?: UPDATE_TYPE
// 	/**  CHAT parziale di aggiornamento */
// 	chat: Partial<ChatDTO>
// }
export type ChatUpdateS2C2 = BaseS2C & {
	action: CHAT_ACTION_S2C.CHAT_UPDATE2
	commands: JsonCommand[]
}

/** un CLIENT è entrato in una CHAT */
export type ClientEnteredS2C = BaseS2C & {
	action: CHAT_ACTION_S2C.CLIENT_ENTERED
	/** un ACCOUNT entra */
	user: AccountDTO
}

/** un CLIENT è uscito da una CHAT */
export type ClientLeaveS2C = BaseS2C & {
	action: CHAT_ACTION_S2C.CLIENT_LEAVE
	/** id del CLIENT */
	userId: string
}

//#endregion


//#region ROOM

/** creata una nuova ROOM */
export type RoomNewS2C = BaseS2C & {
	action: CHAT_ACTION_S2C.ROOM_NEW
	/** id nella nuova ROOM */
	roomId: string
	/** id della PARENT-ROOM  */
	parentRoomId: string
	/** LLM-AGENT di riferimento */
	agentsIds: string[]
}

/** richiesta modifica lista AGENTS in ROOM */
// export type RoomAgentsUpdateS2C = BaseS2C & {
// 	action: CHAT_ACTION_S2C.ROOM_AGENTS_UPDATE
// 	roomId: string
// 	/** new list of AGENTs in ROOM */
// 	agentsIds: string[]
// }

/** richiesta modifica della HISTORY di una ROOM */
export type RoomHistoryUpdateS2C = BaseS2C & {
	action: CHAT_ACTION_S2C.ROOM_HISTORY_UPDATE
	roomId: string
	/** UPDATE to HISTORY */
	updates: MessageUpdate[]
}

//#endregion

//#endregion
