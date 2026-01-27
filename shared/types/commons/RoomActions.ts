import { AccountDTO } from '../account.js';
import { LlmResponse } from "./LlmResponse.js";


/**
 * Un messaggio di chat (compone la HISTORY di una ROOM)
 */
export type ChatMessage = {
	/** identificativo del MESSAGE */
	id?: string;
	/** identifica di chi è il messaggio. Se null è l'utente principale */
	clientId?: string
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
	chatId: string
	parentRoomId?: string
	accountId?: string

	history: ChatMessage[]
	agentsIds: string[]
}

/**
 * Contiene le info per l'aggiornamento di un messaggio nella history
 */
export type MessageUpdate = {
	/** il messaggio di riferimento per la posizione */
	refId?: string
	/** tipo di aggiornamento */
	type: UPDATE_TYPE
	/** nuovo testo del messaggio */
	content: ChatMessage
}

export enum UPDATE_TYPE {
	/** inserisce un nuovo messaggio DOPO messageIdRef (=null all'inizio)*/
	ADD = "add",
	/** inserisce un nuovo messaggio alla fine (messageIdRef è ignorato) */
	APPEND = "append",
	/** sostituisce il contenuto del messaggio */
	REPLACE = "replace",
	/** elimina il messaggio messageIdRef */
	DELETE = "delete",
}



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
 * invito un CLIENT
 */
export type UserInviteC2S = BaseC2S & {
	action: CHAT_ACTION_C2S.USER_INVITE
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




//#region SERVER TO CLIENT

export enum CHAT_ACTION_S2C {

	/** I dati di una CHAT */
	CHAT_INFO = "chat-info",

	/** un CLIENT è entrato in CHAT. Potrebbe essere anche un AGENT*/
	CLIENT_ENTERED = "entered",
	/** un CLIENT è uscita dalla CHAT. Potrebbe essere anche un AGENT */
	CLIENT_LEAVE = "leave",
	/** comunica lo stato di connessione di un CLIENT */
	USER_STATUS = "user-status",

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
 * Invia ad un CLIENT i dati di una CHAT 
 * tipicamente su
 * CHAT_ACTION_C2S.CHAT_CREATE
 * CHAT_ACTION_C2S.CHAT_LOAD_BY_ROOM_AND_ENTER
 * CHAT_ACTION_C2S.USER_INVITE
 * */
export type ChatInfoS2C = BaseS2C & {
	action: CHAT_ACTION_S2C.CHAT_INFO
	/** lista dei CLIENTs presenti */
	clients: AccountDTO[]
	/** lista delle ROOMs. */
	rooms: ChatRoom[]
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

export type UserStatusS2C = {
	action: CHAT_ACTION_S2C.USER_STATUS
	userId: string
	status: "online" | "offline"
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
