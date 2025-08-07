import { Uuid } from "./global"



export interface Llm {
	id: Uuid
	name: string
}

export enum PROVIDER {
	GOOGLE = "google",
	OPENAI = "openai",
}