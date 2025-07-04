import { RootService, Bus } from "@priolo/julian";
import { typeorm } from "@priolo/julian";
import { Agent } from "./repository/Agent.js";



export async function seeding(root: RootService) {

	const tools = await (new Bus(root, "/typeorm/tools")).dispatch({
		type: typeorm.RepoStructActions.SEED,
		payload: [
			{ type: typeorm.RepoStructActions.TRUNCATE },
			{
				name: "multiply",
				description: "This tool multiplies two numbers together",
				parameters: {
					type: "object",
					properties: {
						a: { type: "number", description: `The first number to multiply`, },
						b: { type: "number", description: `The second number to multiply`, },
					},
					required: ["a", "b"],
				},
				code: `return args.a * args.b;`
			},
			{
				name: "add",
				description: "This tool adds two numbers together",
				parameters: {
					type: "object",
					properties: {
						a: { type: "number", description: `The first number to add`, },
						b: { type: "number", description: `The second number to add`, },
					},
					required: ["a", "b"],
				},
				code: `return args.a + args.b;`
			},
		]
	});

	const [agentMath] = await (new Bus(root, "/typeorm/agents")).dispatch({
		type: typeorm.RepoStructActions.SEED,
		payload: [
			{ type: typeorm.RepoStructActions.TRUNCATE },
			<Agent>{
				name: "MATH",
				description: "This agent can add and multiply numbers",
				systemPrompt: "You are a test agent that can add and multiply numbers.",
				contextPrompt: "",
				askInformation: true,
				killOnResponse: true,
				llmDefault: "gemini-2.0-flash",
				tools: [
					{ id: tools[0].id }, { id: tools[1].id },
				],
			},
		]
	});

	await (new Bus(root, "/typeorm/agents")).dispatch({
		type: typeorm.RepoStructActions.SEED,
		payload: [
			<Agent>{
				name: "LEADER",
				description: "This agent can resolve all problem",
				systemPrompt: "",
				contextPrompt: "",
				askInformation: true,
				killOnResponse: false,
				llmDefault: "gemini-2.0-flash",
				subAgents: [
					{ id: agentMath.id },
				]
			},
		]
	});
}
