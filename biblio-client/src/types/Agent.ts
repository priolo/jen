import { Uuid } from "./global"
import { Llm } from "./Llm"
import { Tool } from "./Tool"



export interface Agent {
	id: Uuid
	name: string

	description: string
	systemPrompt: string
	contextPrompt: string
	askInformation: boolean
	killOnResponse: boolean

	llm: Partial<Llm>
	agents: Agent[]
	tools: Tool[]
}
