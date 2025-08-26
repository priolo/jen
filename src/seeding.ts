import { RootService, Bus } from "@priolo/julian";
import { typeorm } from "@priolo/julian";
import { AgentRepo } from "./repository/Agent.js";
import { TOOL_TYPE, ToolRepo } from "./repository/Tool.js";
import { McpServerRepo } from "./repository/McpServer.js";
import { LlmRepo } from "./repository/Llm.js";
import { LLM_MODELS } from "./types/commons/LlmProviders.js";




export async function seeding(root: RootService) {


	const llms = await new Bus(root, "/typeorm/llm").dispatch<LlmRepo[]>({
		type: typeorm.RepoStructActions.SEED,
		payload: <LlmRepo[]>[
			{ type: typeorm.RepoStructActions.TRUNCATE },
			{ name: LLM_MODELS.MISTRAL_LARGE, key: process.env.MISTRAL_API_KEY },
			{ name: LLM_MODELS.GOOGLE_GEMINI_2_0_FLASH, key: process.env.GOOGLE_GENERATIVE_AI_API_KEY },
		]
	});


	const mcpServers = await new Bus(root, "/typeorm/mcp_servers").dispatch<McpServerRepo[]>({
		type: typeorm.RepoStructActions.SEED,
		payload: [
			{ type: typeorm.RepoStructActions.TRUNCATE },
			<McpServerRepo>{
				id: "id-mcp-1",
				name: "local",
				host: "http://localhost:3000/mcp",
			},
			<McpServerRepo>{
				id: "id-mcp-2",
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
				id: "id-tool-1",
				name: "sum",
				// description: "This tool can sum two numbers",
				// parameters: {
				// 	type: "object",
				// 	properties: {
				// 		a: { type: "number", description: "First number" },
				// 		b: { type: "number", description: "Second number" }
				// 	},
				// 	required: ["a", "b"]
				// },
				mcp: mcpServers[0],
			},
			{
				id: "id-tool-2",
				name: "subtract",
				// description: "This tool can subtract two numbers",
				// parameters: {
				// 	type: "object",
				// 	properties: {
				// 		a: { type: "number", description: "First number" },
				// 		b: { type: "number", description: "Second number" }
				// 	},
				// 	required: ["a", "b"]
				// },
				mcp: mcpServers[0],
			},
			{
				id: "id-tool-3",
				name: "multiply",
				description: "This tool can multiply two numbers",
				parameters: {
					type: "object",
					properties: {
						a: { type: "number", description: "First number" },
						b: { type: "number", description: "Second number" }
					},
					required: ["a", "b"]
				},
				type: TOOL_TYPE.CODE,
				code: `(args) => args.a * args.b`,
			},
		]
	});

	const [agentMath] = await (new Bus(root, "/typeorm/agents")).dispatch<AgentRepo[]>({
		type: typeorm.RepoStructActions.SEED,
		payload: <AgentRepo[]>[
			{ type: typeorm.RepoStructActions.TRUNCATE },
			{
				id: "id-agent-math",
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
				id: "id-agent-leader",
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
