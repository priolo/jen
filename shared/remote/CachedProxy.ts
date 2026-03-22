import { ItemProxy } from "@shared/remote/RemoteProxy.js"
import { applyJsonCommand, JsonCommand } from "../update.js"
import { CrudProxy, ICrudProxy } from "./CrudProxy.js"



export class CachedProxy<T extends ItemProxy> extends CrudProxy<T> {

    constructor(
        protected proxy?: ICrudProxy<T>,
        protected items: Map<string, T> = new Map()
    ) {
        super(proxy)
    }


    // --- CACHE ---

    getItem(id: string): T | undefined {
        return this.items.get(id)
    }

    getItems(): T[] {
        return Array.from(this.items.values())
    }

    // --- LOAD (cache-first) ---

    async load(id: string): Promise<T | undefined> {
        let item = this.getItem(id)
        if (!item) {
            item = await this.proxy?.load(id)
            if (item) this.items.set(id, item)
        }
        return item
    }

    async loadAll(filter?: Partial<T>): Promise<T[]> {
        const items = await this.proxy?.loadAll(filter) ?? []
        for (const item of items) this.items.set(item.id, item)
        return items
    }

    // --- WRITE ---

    async save(item: T): Promise<T> {
        const saved = await this.proxy?.save(item) ?? item
        this.items.set(saved.id, saved)
        return saved
    }

    async update(id: string, commands: JsonCommand[]): Promise<T | undefined> {
        const item = this.getItem(id)
        if (!item) return undefined
        for (const cmd of commands) applyJsonCommand(item, cmd)
        item.revision = (item.revision ?? 0) + 1
        await this.proxy?.update(id, commands)
        return item
    }

    async delete(id: string): Promise<boolean> {
        const exists = this.items.delete(id)
        if (!exists) return false
        await this.proxy?.delete(id)
        return true
    }

}