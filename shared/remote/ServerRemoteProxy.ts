import { CreateMessage, Message, MESSAGE_TYPE, SnapshotMessage, UpdateMessage } from "@shared/remote/Message.js"
import { ItemProxy, RemoteProxy } from "./RemoteProxy.js"
import { Envelope, ENVELOPE_TYPE } from "./RemoteTransport.js"



export class ServerRemoteProxy<T extends ItemProxy> extends RemoteProxy<T> {



	
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




	override async onMessage(envelope: Envelope): Promise<void> {
		if (envelope.type != ENVELOPE_TYPE.TO_SERVER || !envelope.from || envelope.proxyId != this.id) return
		const message = envelope.message

		switch (message.type) {

			case MESSAGE_TYPE.SUBSCRIBE: {
				this.addListenerInItem(message.itemId, envelope.from)
				const item = await this.load(message.itemId)
				this.sendMessage(<SnapshotMessage>{
					type: MESSAGE_TYPE.SNAPSHOT,
					itemId: message.itemId,
					item
				})
			} break

			case MESSAGE_TYPE.UNSUBSCRIBE: {
				this.removeListenerFromItem(message.itemId, envelope.from)
			} break

			case MESSAGE_TYPE.CREATE: {
				const msg = message as CreateMessage
				const itemCreated = await this.create(msg.item as T)
				msg.item = itemCreated
				this.sendMessage(msg)
			} break

			case MESSAGE_TYPE.UPDATE: {
				const msg = message as UpdateMessage
				await this.update(message.itemId, msg.commands)
				this.sendMessage(msg)
			} break

			case MESSAGE_TYPE.DELETE: {
				const success = await this.delete(message.itemId)
				if (!success) break // devo avvertire che non è stato possibile eliminare l'ITEM
				this.sendMessage(message)
				this.removeAllListenersFromItem(message.itemId)
			} break
		}
	}

	protected override sendMessage(message: Message): void {
		const listeners = this.listener.get(message.itemId)
		if (!listeners) return
		// tutti i LISTENER di questo ITEM 
		for (const listenerId of listeners) {
			this.transport?.sendMessage({
				type: ENVELOPE_TYPE.TO_CLIENT,
				to: listenerId,
				proxyId: this.id,
				message
			})
		}
	}








}