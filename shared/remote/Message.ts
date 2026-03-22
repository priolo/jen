import { JsonCommand } from "../update.js";
import { ItemProxy } from "./RemoteProxy.js";



export enum MESSAGE_TYPE {

	/** richiesta di aggiornamento di un ITEM */
	SUBSCRIBE = "subscribe",
	/** annullo la richiesta di aggiornamento di un ITEM */
	UNSUBSCRIBE = "unsubscribe",

	/** invio di un'istantanea di un ITEM */
	SNAPSHOT = "snapshot",
	/** */
	INDEX = "index",
	/** creazione/aggiornamento di un ITEM il server risponde con un messaggio di tipo SNAPSHOT  */
	SAVE = "save",
	/** aggiornamento parziale dell'ITEM */
	UPDATE = "update",
	/** eliminazione dell'ITEM all'intertno della callection */
	DELETE = "delete",
}



export type Message = {
	/** il tipo di ACTIN */
	type: MESSAGE_TYPE
	/** identificativo dell'element */
	itemId: string
	/** numero della versione */
	revision?: number

	//messageId: string
}



export type SubscribeMessage = Message & {
	type: MESSAGE_TYPE.SUBSCRIBE
}

export type UnsubscribeMessage = Message & {
	type: MESSAGE_TYPE.UNSUBSCRIBE
}



/**
 * invia lo stato di un ITEM
 * potrebbe essere un ITEM parziale
 */
export type SnapshotMessage = Message & {
	type: MESSAGE_TYPE.SNAPSHOT
	item: Partial<ItemProxy>
}

/**
 * creazione di un nuovo ITEM 
 * il server risponde con un messaggio di tipo SNAPSHOT
 */
export type SaveMessage = Message & {
	type: MESSAGE_TYPE.SAVE
	item: ItemProxy
}

/**
 * Aggiorno un ITEM con una serie di COMANDI JSON
 */
export type UpdateMessage = Message & {
	type: MESSAGE_TYPE.UPDATE
	commands: JsonCommand[]
}

/**
 * Elimino un ITEM
 */
export type DeleteMessage = Message & {
	type: MESSAGE_TYPE.DELETE
}