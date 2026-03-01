import { AGENT_TYPE, AgentDTO } from "@shared/types/AgentDTO"
import { ToolDTO } from "@shared/types/ToolDTO"

export { AGENT_TYPE }

export interface AgentLlm extends AgentDTO {
	subAgents?: Partial<AgentLlm>[]
	tools: Partial<ToolDTO>[]
}