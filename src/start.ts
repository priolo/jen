import dotenv from "dotenv";
import buildNodeConfig from "./config.js";
import { RootService, Bus, typeorm } from "@priolo/julian";
import { ENV_TYPE } from "./utils.js";
import { Agent } from "./repository/Agent.js";



const envFile = `.env.${process.env.NODE_ENV}`;
dotenv.config({ path: envFile });

(async () => {

	console.log(`*** BUILD CONFIG ***`)
	const cnf = buildNodeConfig()
	console.log(`********************************************\n`);

	console.log(`*** START ***`)
	const root = await RootService.Start(cnf)
	console.log(`********************************************\n`)



	if (process.env.NODE_ENV == ENV_TYPE.TEST || (process.env.NODE_ENV == ENV_TYPE.DEV && process.env.DB_DEV_RESET == "true")) {
		console.log("*** SEEDING ***")

		// new Bus(root, "/typeorm/llm").dispatch({
		// 	type: typeorm.RepoStructActions.TRUNCATE
		// })

		const llms = await (new Bus(root, "/typeorm/llm")).dispatch({
			type: typeorm.RepoStructActions.SEED,
			payload: [
				{ type: typeorm.RepoStructActions.TRUNCATE },
				{ name: "test llm 1", key: "AAA" },
				{ name: "test llm 2", key: "BBB" },
				{ name: "test llm 3", key: "CCC" },
			]
		})

		const tools = await (new Bus(root, "/typeorm/tools")).dispatch({
			type: typeorm.RepoStructActions.SEED,
			payload: [
				{ type: typeorm.RepoStructActions.TRUNCATE },
				{ name: "tool 1" },
				{ name: "tool 2" },
				{ name: "tool 3" },
			]
		})

		
		const [agentBase, agentSub1, agentSub2] = await (new Bus(root, "/typeorm/agents")).dispatch({
			type: typeorm.RepoStructActions.SEED,
			payload: [
				{ type: typeorm.RepoStructActions.TRUNCATE },
				<Agent>{
					name: "agent 1",
					description: "This is a test agent 1",
					systemPrompt: "This is a system prompt for agent 1",
					contextPrompt: "This is a context prompt for agent 1",
					askInformation: true,
					killOnResponse: true,
					llmId: llms[0].id, 
					tools: [
						{ id: tools[0].id }, { id: tools[1].id },
						{ id: "uuid-tool-test", name: "tooltest" }
					],
				},
				<Agent>{
					name: "agent sub 1",
					description: "This is a test SUB agent 1",
					systemPrompt: "This is a system prompt for SUB agent 1",
					contextPrompt: "This is a context prompt for SUB agent 1",
					askInformation: true,
					killOnResponse: true,
					llmId: llms[0].id, 
					tools: [
						{ id: tools[0].id }, { id: tools[1].id },
					],
				},
				<Agent>{
					name: "agent SUB 2",
					description: "This is a test agent SUB 2",
					systemPrompt: "This is a system prompt for agent SUB 2",
					contextPrompt: "This is a context prompt for agent SUB 2",
					askInformation: true,
					killOnResponse: true,
					llmId: llms[0].id, 
					tools: [
						{ id: tools[1].id }, { id: tools[2].id },
					],
				}
			]
		})

		await (new Bus(root, "/typeorm/agents")).dispatch({
			type: typeorm.RepoStructActions.SEED,
			payload: [
				<Agent>{
					name: "agent 2",
					description: "This is a test agent 2",
					systemPrompt: "This is a system prompt for agent 2",
					contextPrompt: "This is a context prompt for agent 2",
					askInformation: false,
					killOnResponse: false,
					baseId: agentBase.id,
					llm: llms[1].id, 
					tools: [{ id: tools[2].id }],
					subAgents: [
						{ id: agentSub1.id },
						{ id: agentSub2.id }
					]
				},
				<Agent>{
					name: "agent 3",
					description: "This is a test agent 3",
					systemPrompt: "This is a system prompt for agent 3",
					contextPrompt: "This is a context prompt for agent 3",
					askInformation: true,
					killOnResponse: true,
				},
			]
		})

		console.log(`********************************************\n`)
	}

})()