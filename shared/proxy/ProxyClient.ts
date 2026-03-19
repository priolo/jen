import { Message, MESSAGE_TYPE, SnapshotMessage, SubscribeMessage, UnsubscribeMessage } from "./Message.js"
import { ItemProxy, ProxyBase } from "./ProxyBase.js"
import { Envelope, ENVELOPE_TYPE } from "./Transport.js"



export class ProxyClient<T extends ItemProxy> extends ProxyBase<T> {

	constructor(
		proxyId: string,
		protected clientId: string,
	) {
		super(proxyId)
	}

	/**
	 * Mi metto in ascolto su un ITEM del SERVER, in questo modo riceverò tutti gli aggiornamenti su quell'ITEM
	 */
	public async subscribe(itemId: string) {
		const message: SubscribeMessage = {
			type: MESSAGE_TYPE.SUBSCRIBE,
			itemId,
		}
		this.sendMessage(message)
	}

	public unsuscribe(itemId:string) {
		const message: UnsubscribeMessage = {
			type: MESSAGE_TYPE.UNSUBSCRIBE,
			itemId,
		}
		this.sendMessage(message)
	}



	override async onMessage(envelope: Envelope): Promise<void> {
		if (envelope.type != ENVELOPE_TYPE.TO_CLIENT || envelope.to != this.clientId || envelope.proxyId != this.proxyId) return
		const message = envelope.message

		switch (message.type) {
			case MESSAGE_TYPE.SNAPSHOT:
				const msg = <SnapshotMessage>message
				this.setItem(msg.item)
			break
		}
	}

	override sendMessage(message: Message): void {
		const envelop: Envelope = {
			type: ENVELOPE_TYPE.TO_SERVER,
			from: this.clientId,
			proxyId: this.proxyId,
			message
		}
		this.transport?.sendMessage(envelop)
	}

}