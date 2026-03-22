import { EventEmitter } from "@priolo/jon-utils"
import { ItemProxy } from "@shared/remote/RemoteProxy.js"
import { JsonCommand } from "../update.js"
import { CrudProxy, ICrudProxy } from "./CrudProxy.js"



export class EmitterProxy<T extends ItemProxy> extends CrudProxy<T> {

    constructor(
        protected proxy?: ICrudProxy<T>
    ) { 
        super(proxy)
        this._emitter = new EventEmitter()
    }

    private _emitter: EventEmitter
    get emitter(): EventEmitter { return this._emitter }


    async load(id: string): Promise<T | undefined> {
        const item = await super.load(id)
        this._emitter.emit("load", item)
        return item
    }

    async loadAll(filter?: Partial<T>): Promise<T[]> {
        const items = await super.loadAll(filter) ?? []
        this._emitter.emit("load-all", items)
        return items
    }

    async save(item: T): Promise<T> {
        const saved = await super.save(item) ?? item
        this._emitter.emit("create", saved)
        return saved
    }

    async update(id: string, commands: JsonCommand[]): Promise<T | undefined> {
        const item = await super.update(id, commands)
        this._emitter.emit("update", item)
        return item
    }

    async delete(id: string): Promise<boolean> {
        const exist = await super.delete(id)
        this._emitter.emit("delete", id)
        return exist
    }

}