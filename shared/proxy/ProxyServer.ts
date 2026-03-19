import { Bus, typeorm } from "@priolo/julian"
import { DeleteMessage, Message, MESSAGE_TYPE, SnapshotMessage, UpdateMessage } from "@shared/proxy/Message.js"
import { applyJsonCommand, JsonCommand } from "@shared/update.js"
import { FindOneOptions } from "typeorm"
import { Envelope, ENVELOPE_TYPE, Transport } from "./Transport.js"
import { ItemProxy, ProxyBase } from "./ProxyBase.js"
import { Storage } from "./Storage.js"



export class ProxyServer<T extends ItemProxy> extends ProxyBase<T> {



	private listener = new Map<string, Set<string>>()

	public addListenerInItem(itemId: string, listenerId: string): void {
		if (!this.listener.has(itemId)) {
			this.listener.set(itemId, new Set())
		}
		this.listener.get(itemId).add(listenerId)
	}

	public removeListenerFromItem(itemId: string, listenerId: string): void {
		if (!this.listener.has(itemId)) return
		this.listener.get(itemId).delete(listenerId)
	}

	public removeAllListenersFromItem(itemId: string): void {
		this.listener.delete(itemId)
	}

	public removeListenerInAllItems(listenerId: string): void {
		for (const listeners of this.listener.values()) {
			listeners.delete(listenerId)
		}
	}



	protected storage: Storage<T>

	public setStorage(storage: Storage<T>): void {
		this.storage = storage
	}
	public getStorage(): Storage<T> {
		return this.storage
	}






	override async getAsync(id: string): Promise<T> {
		let item = await super.getAsync(id)
		if (!item) {
			item = await this.storage?.load(id)
			if (item) this.addItem(item)
		}
		return item
	}

	override async onMessage(envelope: Envelope): Promise<void> {
		if (envelope.type != ENVELOPE_TYPE.TO_SERVER || !envelope.from || envelope.proxyId != this.proxyId) return
		const message = envelope.message

		switch (message.type) {

			case MESSAGE_TYPE.SUBSCRIBE:
				this.addListenerInItem(message.itemId, envelope.from)
				const item = await this.getAsync(message.itemId)
				this.sendMessage(<SnapshotMessage>{
					type: MESSAGE_TYPE.SNAPSHOT,
					itemId: message.itemId,
					item
				})
				break

			case MESSAGE_TYPE.UNSUBSCRIBE:
				this.removeListenerFromItem(message.itemId, envelope.from)
				break
		}
	}

	override sendMessage(message: Message): void {
		const listeners = this.listener.get(message.itemId)
		if (!listeners) return
		// tutti i LISTENER di questo ITEM 
		for (const listenerId of listeners) {
			this.transport?.sendMessage({
				type: ENVELOPE_TYPE.TO_CLIENT,
				to: listenerId,
				proxyId: this.proxyId,
				message
			})
		}
	}

}