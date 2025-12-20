import { Bus, RootService, typeorm } from "@priolo/julian";
import { AccountRepo } from "../repository/Account.js";
import { AGENT_TYPE, AgentRepo } from "../repository/Agent.js";
import { LlmRepo } from "../repository/Llm.js";
import { McpServerRepo } from "../repository/McpServer.js";
import { ProviderRepo } from "../repository/Provider.js";
import { TOOL_TYPE, ToolRepo } from "../repository/Tool.js";
import { LLM_MODELS } from "../types/commons/LlmProviders.js";



export async function seeding(root: RootService) {

	const accounts = await new Bus(root, "/typeorm/accounts").dispatch<AccountRepo[]>({
		type: typeorm.RepoStructActions.SEED,
		payload: <AccountRepo[]>[
			{ type: typeorm.RepoStructActions.TRUNCATE },
			{ id: "id-user-1", name: "Giuseppe Verdi", email: "giuseppe.verdi@gmail.com", password: "test" },
			{ id: "id-user-2", name: "Mario Rossi", email: "mario.rossi@gmail.com", password: "test" },
			{ id: "id-user-3", name: "Luigi Bianchi", email: "luigi.bianchi@gmail.com", password: "test" },
		]
	});

	const llms = await new Bus(root, "/typeorm/llms").dispatch<ProviderRepo[]>({
		type: typeorm.RepoStructActions.SEED,
		payload: <LlmRepo[]>[
			{ type: typeorm.RepoStructActions.TRUNCATE },
			{ code: LLM_MODELS.MISTRAL_LARGE, key: process.env.MISTRAL_API_KEY, userId: accounts[0].id },
			{ code: LLM_MODELS.GOOGLE_GEMINI_2_0_FLASH, key: process.env.GOOGLE_GENERATIVE_AI_API_KEY, userId: accounts[0].id },
			{ code: LLM_MODELS.MISTRAL_LARGE, key: process.env.MISTRAL_API_KEY, userId: accounts[1].id },
			{ code: LLM_MODELS.GOOGLE_GEMINI_2_0_FLASH, key: process.env.GOOGLE_GENERATIVE_AI_API_KEY, userId: accounts[1].id },

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
				type: AGENT_TYPE.MOCK,
				description: "Math agent who can add and multiply numbers",
				systemPrompt: "You are a math agent that can add and multiply numbers.",
				contextPrompt: "",
				askInformation: true,
				killOnResponse: true,
				//llmId: llms[0].id,
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
				type: AGENT_TYPE.MOCK,
				description: "General agent who can lead and use subagents",
				systemPrompt: "",
				contextPrompt: "",
				askInformation: true,
				killOnResponse: false,
				//llm: llms[0],
				subAgents: [
					{ id: agentMath.id },
				]
			},
		]
	});
}
