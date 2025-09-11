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
	parentRoomId?: string
	history: ChatMessage[]
	agentsIds: string[]
}




//#region CLIENT TO SERVER

export enum CHAT_ACTION_C2S {
	/* un CLIENT crea e entra in una CHAT */
	CHAT_CREATE_ENTER = "chat-create-enter",

	/* l'USER lascia la CHAT */
	USER_LEAVE = "user-leave",
	/* l'USER invia un messaggio in una ROOM */
	USER_MESSAGE = "user-message",

	/** richiesta di avviare il completamento in una ROOM */
	ROOM_COMPLETE = "room-complete",
}

export type BaseC2S = {
	/** tipo di action */
	action: CHAT_ACTION_C2S
	/** Rifrimento alla CHAT */
	chatId: string
}

/** CLIENT crea e entra in una nuova CHAT */
export type UserCreateEnterC2S = Omit<BaseC2S, "chatId"> & {
	action: CHAT_ACTION_C2S.CHAT_CREATE_ENTER
	// in futuro si potranno creare diversi tipi di CHAT
	// ogni tipo di chat ha un suo parametro di configurazione
	// type: "single-agent" | "free" | "agile" | "document" 
	/** LLM-AGENT di riferimento */
	agentId: string
}

/** CLIENT lascia la CHAT */
export type UserLeaveC2S = BaseC2S & {
	action: CHAT_ACTION_C2S.USER_LEAVE
	/** il client che fa l'azione */
	clientId: string
}

/** inserisce un messaggio USER e chiede il COMPLETE */
export type UserMessageC2S = BaseC2S & {
	action: CHAT_ACTION_C2S.USER_MESSAGE
	/** id della ROOM, se null è la MAIN-ROOM */
	roomId?: string
	/** il testo del messaggio */
	text: string
}

/** richiesta di completamento di una ROOM */
export type RoomCompleteC2S = BaseC2S & {
	action: CHAT_ACTION_C2S.ROOM_COMPLETE
	/** id della ROOM, se null è la MAIN-ROOM */
	roomId?: string
}

//#endregion




//#region SERVER TO CLIENT

export enum CHAT_ACTION_S2C {
	/** 
	 * l'USER è entrato in una CHAT
	 * e riceve i dati iniziali della CHAT
	 * */
	USER_ENTERED = "user-entered",
	/** un CLIENT è entrato in CHAT */
	CLIENT_ENTERED = "entered",
	/** un CLIENT è uscita dalla CHAT */
	CLIENT_LEAVE = "leave",

	/** creata nuova ROOM in CHAT */
	ROOM_NEW = "room-new",
	/** [non usato] informazioni su una ROOM della CHAT */
	ROOM_GET = "room-get",
	/** aggiunto MESSAGE in una ROOM della CHAT  */
	ROOM_MESSAGE = "room-message",
}

export type BaseS2C = {
	action: CHAT_ACTION_S2C
	chatId: string
}


//#region CLIENT

/** L'USER è entrato in CHAT */
export type UserEnteredS2C = BaseS2C & {
	action: CHAT_ACTION_S2C.USER_ENTERED
	/** lista dei CLIENTs presenti */
	clientsIds: string[]
	/** lista delle ROOMs. */
	rooms: ChatRoom[]
}

/** un CLIENT è entrato in una CHAT */
export type ClientEnteredS2C = BaseS2C & {
	action: CHAT_ACTION_S2C.CLIENT_ENTERED
	/** id del CLIENT */
	clientId: string
}

/** un CLIENT è uscito dalla CHAT */
export type ClientLeaveS2C = BaseS2C & {
	action: CHAT_ACTION_S2C.CLIENT_LEAVE
	/** id del CLIENT */
	clientId?: string
}

//#endregion



//#region  MESSAGE

/** è stato inserito un MESSAGE in ROOM  */
export type RoomMessageS2C = BaseS2C & {
	action: CHAT_ACTION_S2C.ROOM_MESSAGE
	/** la stanza in cui è stato inserito */
	roomId: string
	/** il conenuto del messaggio */
	content: ChatMessage
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

//#endregion

//#endregion