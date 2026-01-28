import { REPO_PATHS } from "@/config.js"
import { AgentRepo } from "@/repository/Agent.js"
import { TOOL_TYPE, ToolRepo } from "@/repository/Tool.js"
import AgentRoute from "@/routers/AgentRoute.js"
import { ChatsWSService } from "@/routers/ChatsWSRoute.js"
import McpServerRoute from "@/routers/McpServerRoute.js"
import { Bus, typeorm } from "@priolo/julian"
import { McpTool } from "../mcp/types.js"
import { executeMcpTool, getMcpTools } from "../mcp/utils.js"



export class ChatsContext  {

	constructor(
		private service: ChatsWSService = null,
	) { }

	static McpCache: Map<string, McpTool[]> = new Map()

	public async getAgentRepoById(agentId: string): Promise<AgentRepo> {

		// [II] non va bene! deve raggiungere il nodo con una path!
		const agent: AgentRepo = await AgentRoute.GetById(agentId, this.service, REPO_PATHS.AGENTS)

		// [II] --- mettere in una funzione a parte
		// bisogna recuperare la "description" e "parameters" per i TOOLS
		for (const tool of agent.tools ?? []) {

			// se il TOOL ha la description e i parameters non c'e' bisogno di caricarli
			if (!!tool.description && !!tool.parameters) continue

			// se è di tipo MCP allora li cerco in CACHE o li carico
			if (!!tool.mcpId) {

				// non sono in CACHE allora li carico e li metto in CACHE
				if (!ChatsContext.McpCache.has(tool.mcpId)) {
					// [II] anche questo va ricavato tramite path
					const mcpServer = await McpServerRoute.GetById(tool.mcpId, this.service)
					if (!mcpServer) continue
					const mcpTools = await getMcpTools(mcpServer.host)
					ChatsContext.McpCache.set(mcpServer.id, mcpTools)
				}

				// prendo i tools dal CACHE
				const mcpTools = ChatsContext.McpCache.get(tool.mcpId)
				if (!mcpTools) continue
				const cachedTool = mcpTools.find(t => t.name == tool.name)
				tool.description = cachedTool.description
				tool.parameters = cachedTool.inputSchema
			}
		}
		// [II] --- ---


		return agent
	}

	public async executeTool(toolId: string, args: any): Promise<any> {
		const toolRepo: ToolRepo = await new Bus(this.service, REPO_PATHS.TOOLS).dispatch({
			type: typeorm.Actions.GET_BY_ID,
			payload: toolId
		})

		if (!toolRepo) return null;

		if (toolRepo.type == TOOL_TYPE.CODE) {
			if (!toolRepo.code) return "Tool without code"
			// eseguo il codice
			try {
				//const func = new Function('args', `return (${toolRepo.code})(args)`)
				const func = new Function(toolRepo.code)
				const result = func(args)
				// Handle both sync and async functions
				return await Promise.resolve(result)
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error)
				return `Tool execution error: ${errorMessage}`
			}
		}

		if (toolRepo.type == TOOL_TYPE.MCP) {
			const mcpServer = await McpServerRoute.GetById(toolRepo.mcpId, this.service)
			if (!mcpServer) return `MCP Server not found: ${toolRepo.mcpId}`
			return await executeMcpTool(mcpServer.host, toolRepo.name, args)
		}

		return "Tool type not supported"
	}

}