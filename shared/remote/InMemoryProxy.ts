import { applyJsonCommand, JsonCommand } from "@shared/update.js"
import { CrudProxy, ICrudProxy } from "./CrudProxy.js"
import { ItemProxy } from "@shared/remote/RemoteProxy.js"



/**
 * Implementazione in memoria di StoreTransport.
 * Lavora direttamente su un array di oggetti passato nel costruttore.
 */
export class ArrayDataProxy<T extends ItemProxy> extends CrudProxy<T> {

	constructor(
		protected source: T[],
		protected proxy?: ICrudProxy<T>
	) {
		super(proxy)
	}



	async load(id: string): Promise<T | undefined> {
		return this.source.find(item => item.id === id)
	}

	async loadAll(filter?: Partial<T>): Promise<T[]> {
		if (!filter) return [...this.source]
		return this.source.filter(item =>
			Object.keys(filter).every(key => (item as any)[key] === (filter as any)[key])
		)
	}

	async save(item: T): Promise<T> {
		if (!item.id) item.id = crypto.randomUUID()
		const index = this.source.findIndex(i => i.id == item.id)
		if (index == -1) {
			this.source.push(item)
		} else {
			this.source[index] = item
		}
		return item
	}

	async update(id: string, commands: JsonCommand[]): Promise<T> {
		const item = this.source.find(item => item.id === id)
		if (!item) return
		for (const cmd of commands) applyJsonCommand(item, cmd)
		return item
	}

	async delete(id: string): Promise<boolean> {
		const index = this.source.findIndex(item => item.id === id)
		if (index == -1) return false
		this.source.splice(index, 1)
		return true
	}
}
