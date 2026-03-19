import { Bus, typeorm } from "@priolo/julian"
import { DeleteMessage, Message, MESSAGE_TYPE, UpdateMessage } from "@shared/proxy/Message.js"
import { applyJsonCommand, JsonCommand } from "@shared/update.js"
import { FindOneOptions } from "typeorm"
import { Envelope, Transport } from "./Transport.js"
import { EventEmitter } from "@priolo/jon-utils"


export type ItemProxy = { id: string, revision?: number }


export interface Task {
	Promise: Promise<any>
	trigger: () => void
}


export abstract class ProxyBase<T extends ItemProxy> {

	constructor(
		protected proxyId: string,
	) {
		this._emitter = new EventEmitter()
	}


	protected items: Map<string, T> = new Map()

	/**
	 * Permette di emettere un evento
	 * serve per oggetti esterni ai nodi
	 */
	get emitter(): EventEmitter {
		return this._emitter
	}
	private _emitter: EventEmitter



	//#region GETTERS

	private tasks = new Map<string, Promise<T>>()

	public getAll(): T[] {
		return Array.from(this.items.values())
	}

	public get(id: string): T | undefined {
		return this.items.get(id)
	}

	public async getAsync(id: string): Promise<T> {
		return this.get(id)
	}


	//#endregion



	//#region CRUD

	public setItem(item: T): void {
		this.items.set(item.id, item)
		this._emitter.emit("set", item)
	}

	public removeItem(id: string) {
		const exist = this.items.delete(id)
		if (!exist) return false

		const msg: DeleteMessage = {
			type: MESSAGE_TYPE.DELETE,
			itemId: id,
		}
		this.sendMessage(msg)

		this.removeAllListenersFromItem(id)
	}

	public updateItem(id: string, commands: JsonCommand[]): T | undefined {
		const item = this.get(id)
		if (!item) return
		for (const cmd of commands) {
			applyJsonCommand(item, cmd)
		}
		item.revision = (item.revision ?? 0) + 1

		const msg: UpdateMessage = {
			type: MESSAGE_TYPE.UPDATE,
			entity: this.proxyId,
			itemId: item.id,
			revision: item.revision,
			commands,
		}
		this.sendMessage(msg)

		return item
	}

	//#endregion


	//#region REMOTE SYNC


	protected transport: Transport

	public setTransport(transport: Transport) {
		this.transport = transport
	}
	public getTransport(): Transport {
		return this.transport
	}




	protected abstract sendMessage(message: Message): void

	public abstract onMessage(envelope: Envelope): Promise<void>

	//#endregion


	//#region STORAGE

	// protected async load(id: string): Promise<T> {
	// 	const item: T = await new Bus(this.service, this.proxyId).dispatch({
	// 		type: typeorm.Actions.FIND_ONE,
	// 		payload: <FindOneOptions<T>>{
	// 			where: { id },
	// 		}
	// 	})
	// 	return item
	// }

	// protected async save(item: T): Promise<void> {
	// 	return new Bus(this.service, this.proxyId).dispatch({
	// 		type: typeorm.Actions.SAVE,
	// 		payload: item,
	// 	})
	// }

	//#endregion
}