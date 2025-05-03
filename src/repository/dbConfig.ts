import fs from "fs";
import { ENV_TYPE } from "../utils.js";
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// in base ai settaggi dell'env imposto la connessione al DB
export const getDBConnectionConfig = () => {

	// se c'e' una path allora stiamo parlando di SQLITE
	if (process.env.DB_DIR != null) {
		let dbPath: string
		const base = path.join(__dirname, "../", process.env.DB_DIR)

		if (process.env.NODE_ENV == ENV_TYPE.TEST) {
			if (!dbPath) dbPath = path.join(base, "/database.test.sqlite")
			try { if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath) }
			catch (e) { console.log(e) }
		} else if (process.env.NODE_ENV == ENV_TYPE.DEV) {
			dbPath = path.join(base, "/database.dev.sqlite")
		} else {
			dbPath = path.join(base, "/database.sqlite")
		}

		return {
			type: "sqlite",
			database: dbPath,
			synchronize: true,
			logging: true,
		}
	}
	
	// ... altrimenti MYSQL
	return {
		type: "mysql",
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		synchronize: true,
		logging: true,
	}
}