import { ItemProxy } from "@shared/remote/RemoteProxy.js"
import { JsonCommand } from "@shared/update.js"



/**
 * Permette di recuperare e settare dati da un array di oggetti
 */
export interface ICrudProxy<T extends ItemProxy> {
    load(id: string): Promise<T | undefined>
    loadAll(filter?: Partial<T>): Promise<T[]>
    save(item: T): Promise<T>
    update(id: string, commands: JsonCommand[]): Promise<T | undefined>
    delete(id: string): Promise<boolean>
}

/**
 * Permette di recuperare e settare dati da un array di oggetti
 */
export abstract class CrudProxy<T extends ItemProxy> implements ICrudProxy<T> {
    
    constructor(
        protected proxy?: ICrudProxy<T>
    ) {}


    load(id: string): Promise<T | undefined> {
        return this.proxy?.load(id)
    }
    loadAll(filter?: Partial<T>): Promise<T[]> {
        return this.proxy?.loadAll(filter) ?? Promise.resolve([])
    }
    save(item: T): Promise<T> {
        return this.proxy?.save(item) ?? Promise.resolve(item)
    }
    update(id: string, commands: JsonCommand[]): Promise<T> {
        return this.proxy?.update(id, commands) ?? Promise.resolve(undefined)
    }
    delete(id: string): Promise<boolean> {
        return this.proxy?.delete(id) ?? Promise.resolve(false)
    }


    getProxy(): ICrudProxy<T> {
        return this.proxy
    }
    setProxy(proxy: ICrudProxy<T>): void {
        this.proxy = proxy
    }
}

