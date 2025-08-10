import { RootService, Bus } from "@priolo/julian";
import { typeorm } from "@priolo/julian";
import { AgentRepo } from "./repository/Agent.js";
import { ToolRepo } from "./repository/Tool.js";
import { McpServerRepo } from "./repository/McpServer.js";
import { LlmRepo } from "./repository/Llm.js";




export async function seeding(root: RootService) {


	const llms = await new Bus(root, "/typeorm/llm").dispatch<LlmRepo[]>({
		type: typeorm.RepoStructActions.SEED,
		payload: <LlmRepo[]>[
			{ type: typeorm.RepoStructActions.TRUNCATE },
			{ name: "gemeni-2.0-flash" },
			{ name: "gemini-2.0-pro" },
			{ name: "gpt-4o" },
			{ name: "gpt-4o-mini" },
			{ name: "claude-2" },
			{ name: "claude-3" },
			{ name: "claude-3-sonnet" }
		]
	});


	const mcpServers = await new Bus(root, "/typeorm/mcp_servers").dispatch<McpServerRepo[]>({
		type: typeorm.RepoStructActions.SEED,
		payload: <McpServerRepo[]>[
			{ type: typeorm.RepoStructActions.TRUNCATE },
			{
				name: "local",
				host: "http://localhost:3000/mcp",
			},
			{
				name: "test",
				host: "https://text-extractor.mcp.inevitable.fyi/mcp",
			},
		]
	});

	const tools = await new Bus(root, "/typeorm/tools").dispatch<ToolRepo[]>({
		type: typeorm.RepoStructActions.SEED,
		payload: <ToolRepo[]>[
			{ type: typeorm.RepoStructActions.TRUNCATE },
			{
				name: "sum",
				mcp: mcpServers[0],
			},
			{
				name: "subtract",
				mcp: mcpServers[0],
			},
		]
	});

	const [agentMath] = await (new Bus(root, "/typeorm/agents")).dispatch<AgentRepo[]>({
		type: typeorm.RepoStructActions.SEED,
		payload: <AgentRepo[]>[
			{ type: typeorm.RepoStructActions.TRUNCATE },
			{
				name: "MATH",
				description: "This agent can add and multiply numbers",
				systemPrompt: "You are a test agent that can add and multiply numbers.",
				contextPrompt: "",
				askInformation: true,
				killOnResponse: true,
				llmId: llms[0].id,
				tools: [
					{ id: tools[0].id }, { id: tools[1].id },
				],
			},
		]
	});

	await (new Bus(root, "/typeorm/agents")).dispatch({
		type: typeorm.RepoStructActions.SEED,
		payload: <AgentRepo[]>[
			{
				name: "LEADER",
				description: "This agent can resolve all problem",
				systemPrompt: "",
				contextPrompt: "",
				askInformation: true,
				killOnResponse: false,
				llm: llms[0],
				subAgents: [
					{ id: agentMath.id },
				]
			},
		]
	});
}
