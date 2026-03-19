import { JsonCommand } from "../update.js";
import { ItemProxy } from "./ProxyBase.js";



export enum MESSAGE_TYPE {
	UPDATE = "update",
	DELETE = "delete",
	SUBSCRIBE = "subscribe",
	UNSUBSCRIBE = "unsubscribe",
	SNAPSHOT = "snapshot",
}




export type Message = {
	/** il tipo di ACTIN */
	type: MESSAGE_TYPE
	/** nome della collection */
	//entity: string
	/** identificativo dell'element */
	itemId: string
	/** numero della versione */
	revision?: number

	//messageId: string
}


/**
 * Aggiorno un ITEM con una serie di COMANDI JSON
 */
export type UpdateMessage = Message & {
	type: MESSAGE_TYPE.UPDATE
	commands: JsonCommand[]
}

export type SubscribeMessage = Message & {
	type: MESSAGE_TYPE.SUBSCRIBE
}

export type UnsubscribeMessage = Message & {
	type: MESSAGE_TYPE.UNSUBSCRIBE
}

export type SnapshotMessage = Message & {
	type: MESSAGE_TYPE.SNAPSHOT
	item: ItemProxy
}



/**
 * Elimino un ITEM
 */
export type DeleteMessage = Message & {
	type: MESSAGE_TYPE.DELETE
}