import { Uuid } from "./global"
import { Llm } from "./Llm"
import { Tool } from "./Tool"



export interface Agent {
	id: Uuid
	name: string
	//type: AGENT_TYPE

	description: string
	systemPrompt: string
	contextPrompt: string
	askInformation: boolean
	killOnResponse: boolean

	llm?: Partial<Llm>
	llmId?: string

	baseId?: string
	base?: Partial<Agent>
	derivedAgents: Partial<Agent>[]

	subAgents?: Partial<Agent>[]
	parentAgents?: Partial<Agent>[]
	
	tools: Partial<Tool>[]
}

export enum AGENT_TYPE {
	REASONING = "REASONING",
	FINDER = "FINDER",
}



// prompt

export interface Message {
	role: string
	content: string
	timestamp: string
}
