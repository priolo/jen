import { Uuid } from "./global"
import { Tool } from "./Tool"



export interface Agent {
	id: Uuid
	name: string
	//type: AGENT_TYPE

	/** utilizzato per la descrizione all'interno dei TOOL */
	description: string
	/** prompt di system */
	systemPrompt: string
	/** prompt user di descrizione del contesto */
	contextPrompt: string
	
	askInformation: boolean
	killOnResponse: boolean

	llmDefault?: string

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
