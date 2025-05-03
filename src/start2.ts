import dotenv from "dotenv";
import buildNodeConfig from "./config.js";
import { ENV_TYPE } from "./utils.js";





const envFile = `.env.${process.env.NODE_ENV}`;
dotenv.config({ path: envFile });


(async () => {

	console.log(`*** BUILD CONFIG ***`)
	const cnf = buildNodeConfig()
	console.log(JSON.stringify(cnf, null, "\t"))
	console.log(`********************************************\n`);

	console.log(`*** ENVIROMENT "${process.env.NODE_ENV}" ***`)
	console.log('*** Process Environment Variables:', process.env)
	console.log(`*** START ***`)
	const root = await RootService.Start(cnf)
	console.log(`********************************************\n`)
	
	



	if (process.env.NODE_ENV == ENV_TYPE.TEST || (process.env.NODE_ENV == ENV_TYPE.DEV && process.env.DB_DEV_RESET == "true")) {
		console.log("*** SEEDING ***")

		new Bus(root, "/typeorm/docs").dispatch({
			type: RepoStructActions.TRUNCATE
		})

		new Bus(root, "/typeorm/users").dispatch({
			type: RepoStructActions.SEED,
			payload: [
				{ type: RepoStructActions.TRUNCATE },
				// inserisco dei dati fittizi
				{ email: "pippoburrasca@gmail.com", name: "Pippo", docs: [{ label: "pippo1 - cipolla" }, { label: "pippo1 - diometrario" }] },
				{ email: "gianf.dionisio@libero.com", name: "Gianfranco", docs: [{ label: "gianf - sincopato" }] },
				{
					email: "pap.interruptus@gmail.com",
					name: "Papa",
					docs: [
						{ label: "pap - pallisco" },
						{
							id: "test-uuid",
							label: "doc di riferimento",
							children: [
								{
									type: "chapter",
									children: [{ text: "Dibattito sull'essere umano e le sue interazioni col mondo" }],
								},
								{
									type: "paragraph",
									children: [{ text: "Il primo scontro: il conetto dello spurgo" }],
								},
								{
									type: "text",
									children: [{ text: "Vorrei sottolineare in questa occasione che l'alalisi è stata condotta su topi e non su veri esseri umani\nMa il concetto è lo stesso dai cioe' c'hanno entrambi la bocca no?" }],
								},
							]
						},
					]
				},
			]
		})

		console.log(`********************************************\n`)
	}
})()