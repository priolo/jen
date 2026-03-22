import { ICrudProxy } from "@shared/remote/CrudProxy.js"
import { SaveMessage, Message, MESSAGE_TYPE, SnapshotMessage, SubscribeMessage, UnsubscribeMessage, UpdateMessage } from "./Message.js"
import { ItemProxy, RemoteProxy } from "./RemoteProxy.js"
import { Envelope, ENVELOPE_TYPE, RemoteTransport } from "./RemoteTransport.js"
import { JsonCommand } from "@shared/update.js"



export class ClientRemoteProxy<T extends ItemProxy> extends RemoteProxy<T> {

	constructor(
		protected id: string,
		protected clientId: string,
		protected proxy?: ICrudProxy<T>,
		protected transport?: RemoteTransport,
	) {
		super(id, proxy, transport)
	}


	/**
	 * Mi metto in ascolto su un ITEM del SERVER, in questo modo riceverò tutti gli aggiornamenti su quell'ITEM
	 */
	public subscribe(itemId: string) {
		const message: SubscribeMessage = {
			type: MESSAGE_TYPE.SUBSCRIBE,
			itemId,
		}
		this.sendMessage(message)
		return this
	}

	public unsubscribe(itemId: string) {
		const message: UnsubscribeMessage = {
			type: MESSAGE_TYPE.UNSUBSCRIBE,
			itemId,
		}
		this.sendMessage(message)
		return this
	}


	//#region CrudProxy implementation

	override async load(id: string): Promise<T> {
		const item = super.load(id)
		// if (!item) {
		// 	const message: UnsubscribeMessage = {
		// 		type: MESSAGE_TYPE.SNAP,
		// 		itemId,
		// 	}
		// 	this.sendMessage(message)
		// }
		return item
	}

	override async loadAll(filter?: Partial<T>): Promise<T[]> {
		return super.loadAll(filter)
	}

	override async save(item: T): Promise<T> {
		const message: SaveMessage = {
			type: MESSAGE_TYPE.SAVE,
			itemId: null,
			item,
		}
		this.sendMessage(message)
		return super.save(item)
	}

	override async update(id: string, commands: JsonCommand[]): Promise<T> {
		const message: UpdateMessage = {
			type: MESSAGE_TYPE.UPDATE,
			itemId: id,
			commands,
		}
		this.sendMessage(message)
		return super.update(id, commands)
	}

	override async delete(id: string): Promise<boolean> {
		const message: Message = {
			type: MESSAGE_TYPE.DELETE,
			itemId: id,
		}
		this.sendMessage(message)
		return super.delete(id)
	}

	//#endregion


	//#region RemoteProxy implementation

	override async onMessage(envelope: Envelope): Promise<void> {
		if (envelope.type != ENVELOPE_TYPE.TO_CLIENT || envelope.to != this.clientId || envelope.proxyId != this.id) return
		const message = envelope.message

		switch (message.type) {
			case MESSAGE_TYPE.SNAPSHOT: {
				const msg = <SnapshotMessage>message
				super.save(msg.item as T)
			} break
			case MESSAGE_TYPE.INDEX: {
			} break
			case MESSAGE_TYPE.SAVE: {
				const msg = <SaveMessage>message
				super.save(msg.item as T)
			} break
			case MESSAGE_TYPE.UPDATE: {
				const msg = <UpdateMessage>message
				super.update(msg.itemId, msg.commands)
			} break
			case MESSAGE_TYPE.DELETE: {
				super.delete(message.itemId)
			} break
			default: {
				console.warn("Message type not supported", message.type)
			}
		}
	}

	protected override sendMessage(message: Message): void {
		const envelop: Envelope = {
			type: ENVELOPE_TYPE.TO_SERVER,
			from: this.clientId,
			proxyId: this.id,
			message
		}
		this.transport?.sendMessage(envelop)
	}

	//#endregion

}