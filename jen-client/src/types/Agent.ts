import { Tool } from "./Tool"
import { AgentDTO, AGENT_TYPE } from "@shared/types/AgentDTO"

export { AGENT_TYPE }

export interface AgentLlm extends AgentDTO {
	subAgents?: Partial<AgentLlm>[]
	tools: Partial<Tool>[]
}