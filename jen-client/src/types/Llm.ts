import { Uuid } from "./global"

export interface Llm {
	id: Uuid
	name: string
	key?: string
}

