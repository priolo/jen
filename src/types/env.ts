import dotenv from "dotenv";



export function envInit() {
	dotenv.config({ path: '.env' });
	const envFile = `.env.${process.env.NODE_ENV}`;
	dotenv.config({ path: envFile });
}

export enum ENV_TYPE {
	TEST = "test",
	DEV = "development",
	PROD = "production",
}