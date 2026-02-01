import { AccountDTO } from "./account.js";
import { ChatDTO } from "./ChatDTO.js";
import { MessageUpdate, UPDATE_TYPE } from "./ChatMessage.js";


//#region SERVER TO CLIENT

export enum CHAT_ACTION_S2C {

	/** I dati di una CHAT-ONLINE */
	CHAT_UPDATE = "chat-update",

	/** un CLIENT è entrato in CHAT. Potrebbe essere anche un AGENT*/
	CLIENT_ENTERED = "user-entered",
	/** un CLIENT è uscita dalla CHAT. Potrebbe essere anche un AGENT */
	CLIENT_LEAVE = "user-leave",
	/** comunica lo stato di connessione di un CLIENT */
	//USER_STATUS = "user-status",

	/** creata nuova ROOM in CHAT */
	ROOM_NEW = "room-new",
	/** comunica un aggiornamento degli AGENTS in una ROOM */
	ROOM_AGENTS_UPDATE = "room-agents-update",
	/** comunica l'aggiornamento della HISTORY di una ROOM */
	ROOM_HISTORY_UPDATE = "room-history-update",
}


export type BaseS2C = {
	action: CHAT_ACTION_S2C
	chatId: string
}


//#region CLIENT

/** 
 * aggiorno la CHAT
 * */
export type ChatUpdateS2C = BaseS2C & {
	action: CHAT_ACTION_S2C.CHAT_UPDATE
	type?: UPDATE_TYPE
	/**  CHAT parziale di aggiornamento */
	chat: Partial<ChatDTO>
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

// export type UserStatusS2C = {
// 	action: CHAT_ACTION_S2C.USER_STATUS
// 	userId: string
// 	status: "online" | "offline"
// }

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
export type RoomAgentsUpdateS2C = BaseS2C & {
	action: CHAT_ACTION_S2C.ROOM_AGENTS_UPDATE
	roomId: string
	/** new list of AGENTs in ROOM */
	agentsIds: string[]
}

/** richiesta modifica della HISTORY di una ROOM */
export type RoomHistoryUpdateS2C = BaseS2C & {
	action: CHAT_ACTION_S2C.ROOM_HISTORY_UPDATE
	roomId: string
	/** UPDATE to HISTORY */
	updates: MessageUpdate[]
}

//#endregion

//#endregion
