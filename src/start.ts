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
				// inserisco dei dati fittizi
				{ name: "test llm 1", key: "AAA" },
				{ name: "test llm 2", key: "BBB" },
				{ name: "test llm 3", key: "CCC" },
			]
		})

		console.log(`********************************************\n`)
	}

})()