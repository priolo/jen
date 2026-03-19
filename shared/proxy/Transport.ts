import { Message } from "@shared/proxy/Message.js";



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

export interface Transport {

	/** invia un MESSAGE ad un LISTENER */
	sendMessage<T extends Message = Message>(envelop:Envelope<T>): void | Promise<void>;

}