import dotenv from "dotenv";
dotenv.config({ path: '.env' });
const envFile = `.env.${process.env.NODE_ENV}`;
dotenv.config({ path: envFile });
