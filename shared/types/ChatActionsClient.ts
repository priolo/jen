import { MessageUpdate } from "./ChatMessage.js";


//#region CLIENT TO SERVER

export enum CHAT_ACTION_C2S {
	/** un USER crea una CHAT e ci entra*/
	CHAT_CREATE_AND_ENTER = "chat-create",
	/** un USER cerca/carica una CHAT ed entra */
	CHAT_LOAD_AND_ENTER = "chat-get",

	/* USER lascia la CHAT */
	USER_LEAVE = "user-leave",
	/* Invita unn USER alla chat */
	USER_INVITE = "user-invite",
	/** rimuove un USER da una CHAT */
	USER_REMOVE = "user-remove",

	/** aggiorna la lista degli AGENT in una ROOM */
	ROOM_AGENTS_UPDATE = "room-agents-update",
	/** aggiorna la HISTORY di una ROOM */
	ROOM_HISTORY_UPDATE = "room-history-update",
}

export type BaseC2S = {
	/** tipo di action */
	action: CHAT_ACTION_C2S
	/** Rifrimento alla CHAT */
	chatId: string
}

/** 
 * CLIENT cerca/crea una CHAT trmite l'id 
 * - inserisce l'user nella CHAT
 * - restituisce i dati della CHAT [ChatInfoS2C]
 */
export type ChatGetC2S = BaseC2S & {
	action: CHAT_ACTION_C2S.CHAT_LOAD_AND_ENTER
}

/** 
 * CLIENT crea una nuova CHAT 
 * - eventualmente inserisce degli AGENTS nella MAIN ROOM
 * - inserisce l'user nella CHAT
 * - restituisce i dati della CHAT creata [ChatInfoS2C]
 */
export type ChatCreateC2S = BaseC2S & {
	action: CHAT_ACTION_C2S.CHAT_CREATE_AND_ENTER
	/** OPZIONALE. I primi agenti da inserire nella ROOM  */
	agentIds?: string[]
}



//#region USER

/** CLIENT lascia una CHAT */
export type UserLeaveC2S = BaseC2S & {
	action: CHAT_ACTION_C2S.USER_LEAVE
}

/** 
 * invito un USER in CHAT
 */
export type UserInviteC2S = BaseC2S & {
	action: CHAT_ACTION_C2S.USER_INVITE
	userId: string
}

/** 
 * rimuovo un USER da una CHAT
 */
export type UserRemoveC2S = BaseC2S & {
	action: CHAT_ACTION_C2S.USER_REMOVE
	userId: string
}

//#endregion



/** richiesta modifica lista AGENTS in ROOM */
export type RoomAgentsUpdateC2S = BaseC2S & {
	action: CHAT_ACTION_C2S.ROOM_AGENTS_UPDATE
	roomId: string
	/** new list of AGENTs in ROOM */
	agentsIds: string[]
}

/** richiesta modifica della HISTORY di una ROOM */
export type RoomHistoryUpdateC2S = BaseC2S & {
	action: CHAT_ACTION_C2S.ROOM_HISTORY_UPDATE
	roomId: string
	/** UPDATE to HISTORY */
	updates: MessageUpdate[]
}

//#endregion
