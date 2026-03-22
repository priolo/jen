import { Message } from "@shared/remote/Message.js"
import { CrudProxy, ICrudProxy } from "@shared/remote/CrudProxy.js"
import { Envelope, RemoteTransport } from "./RemoteTransport.js"



export type ItemProxy = { id: string, revision?: number }

export abstract class RemoteProxy<T extends ItemProxy> extends CrudProxy<T> {

	constructor(
		protected id: string,
		protected proxy?: ICrudProxy<T>,
		protected transport?: RemoteTransport,
	) {
		super(proxy)
	}

	protected abstract sendMessage(message: Message): void

	public abstract onMessage(envelope: Envelope): Promise<void>

	//#endregion

	setTransport(transport: RemoteTransport): void {
		this.transport = transport
	}
	getTransport(): RemoteTransport {
		return this.transport
	}

	onConnect(): void | Promise<void> {
		// da implementare nelle classi figlie
	}
	onDisconnect(): void | Promise<void> {
		// da implementare nelle classi figlie
	}
}