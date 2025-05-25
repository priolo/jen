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

	base?: Partial<Agent>
	subAgents: Agent[]
	llm: Llm
	tools: Tool[]
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
