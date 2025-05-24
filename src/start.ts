import dotenv from "dotenv";
import buildNodeConfig from "./config.js";
import { RootService, Bus, typeorm } from "@priolo/julian";
import { ENV_TYPE } from "./utils.js";


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

		new Bus(root, "/typeorm/llm").dispatch({
			type: typeorm.RepoStructActions.TRUNCATE
		})

		new Bus(root, "/typeorm/llm").dispatch({
			type: typeorm.RepoStructActions.SEED,
			payload: [
				{ type: typeorm.RepoStructActions.TRUNCATE },
				{ name: "test llm 1", key: "AAA" },
				{ name: "test llm 2", key: "BBB" },
				{ name: "test llm 3", key: "CCC" },
			]
		})

		new Bus(root, "/typeorm/agents").dispatch({
			type: typeorm.RepoStructActions.SEED,
			payload: [
				{ type: typeorm.RepoStructActions.TRUNCATE },
				{ name: "agent 1", tools: [{ name: "tool 4" }, { name: "tool 5" }] },
				{ name: "agent 2" },
				{ name: "agent 3", tools: [{ name: "tool 7" }, { name: "tool 6" }] },
			]
		})

		new Bus(root, "/typeorm/tools").dispatch({
			type: typeorm.RepoStructActions.SEED,
			payload: [
				{ type: typeorm.RepoStructActions.TRUNCATE },
				{ name: "tool 1" },
				{ name: "tool 2" },
				{ name: "tool 3" },
			]
		})

		console.log(`********************************************\n`)
	}

})()