import { RootService, Bus } from "@priolo/julian";
import { typeorm } from "@priolo/julian";
import { Agent } from "./repository/Agent.js";
import { Tool } from "./repository/Tool.js";
import { McpServer } from "./repository/McpServer.js";
import { Llm } from "./repository/Llm.js";




export async function seeding(root: RootService) {


	const llms = await new Bus(root, "/typeorm/llm").dispatch<Llm[]>({
		type: typeorm.RepoStructActions.SEED,
		payload: <Llm[]>[
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


	const mcpServers = await new Bus(root, "/typeorm/mcp_servers").dispatch<McpServer[]>({
		type: typeorm.RepoStructActions.SEED,
		payload: <McpServer[]>[
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

	const tools = await new Bus(root, "/typeorm/tools").dispatch<Tool[]>({
		type: typeorm.RepoStructActions.SEED,
		payload: <Tool[]>[
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

	const [agentMath] = await (new Bus(root, "/typeorm/agents")).dispatch<Agent[]>({
		type: typeorm.RepoStructActions.SEED,
		payload: <Agent[]>[
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
		payload: <Agent[]>[
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
