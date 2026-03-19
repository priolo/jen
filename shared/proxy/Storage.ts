import { ItemProxy } from "./ProxyBase.js";



export interface Storage<T extends ItemProxy> {

	load(id: string): Promise<T | undefined> 
	
	save(item: T): Promise<void> 
			
}