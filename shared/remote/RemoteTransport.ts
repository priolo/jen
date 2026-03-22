import { Message } from "@shared/remote/Message.js";



export enum ENVELOPE_TYPE {
	TO_SERVER = "to-server",
	TO_CLIENT = "to-client",
}


export interface Envelope<T extends Message = Message> {
	type: ENVELOPE_TYPE
	from?: string
	to?: string
	proxyId?: string
	message: T
}

/**
 * E' il livello per la comunicazione websocket
 */
export interface RemoteTransport {
	/** invia un MESSAGE ad un LISTENER */
	sendMessage<T extends Message = Message>(envelop:Envelope<T>): void | Promise<void>;
}