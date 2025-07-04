import { RootService } from "@priolo/julian";
import dotenv from "dotenv";
import buildNodeConfig from "./config.js";
import { ENV_TYPE } from "./utils.js";
import { seeding } from "./seeding.js";



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
		await seeding(root)
		console.log(`********************************************\n`)
	}

})()

