import { http, httpRouter, httpStatic, jwt, log, typeorm, types, ws, email as emailNs } from "@priolo/julian";
import { TypeLog } from "@priolo/julian/dist/core/types.js";
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { AccountRepo } from "./repository/Account.js";
import { AgentRepo } from './repository/Agent.js';
import { LlmRepo } from './repository/Llm.js';
import { McpServerRepo } from "./repository/McpServer.js";
import { RoomRepo } from "./repository/Room.js";
import { ToolRepo } from "./repository/Tool.js";
import AccountRoute from "./routers/AccountRoute.js";
import AgentRoute from './routers/AgentRoute.js';
import AuthEmailRoute from "./routers/AuthEmailRoute.js";
import AuthGithubRoute from "./routers/AuthGithubRoute.js";
import AuthGoogleRoute from "./routers/AuthGoogleRoute.js";
import AuthRoute from "./routers/AuthRoute.js";
import McpServerRoute from "./routers/McpServerRoute.js";
import LlmRoute from "./routers/LlmRoute.js";
import { WSRoomsConf, WSRoomsService } from "./routers/RoomsWSRoute.js";
import ToolRoute from "./routers/ToolRoute.js";
import tools from "./startup/config_tools.js";
import { getDBConnectionConfig } from './startup/dbConfig.js';



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const PORT = process.env.PORT || 3000;
export const WS_PORT = +(process.env.WS_PORT || 3010)

type ConfigParams = {
	noWs?: boolean,
	noLog?: boolean,
	noHttp?: boolean,
	port?: number,
}

const logTerminal = process.env.LOG_TERMINAL_ENABLE == "true"
const logFile = process.env.LOG_FILE_ENABLE == "true"

function buildNodeConfig(params?: ConfigParams) {

	const { noWs, noHttp, port } = params ?? {}

	return [

		<log.conf>{
			class: "log",
			exclude: [types.TypeLog.SYSTEM],
			onParentLog: (logItem) => {
				if (!logFile && !logTerminal) return false
				if (logItem.type != TypeLog.ERROR) {
					// no log interni di init e destroy dei nodi
					if (!!logItem?.payload && ['nc:init', 'nc:destroy', "ns:set-state"].includes(logItem.payload.type)) return false
					// no log su source = /jwt
					if (logItem.source == "/jwt") return false
					// se è un email non mandare anche il payload!
					if (logItem.source == "/email-noreply") logItem.payload = "[HIDDEN EMAIL PAYLOAD]"
					if (logItem.name == "HTTP POST /api/stripe/webhook") logItem.payload = "[HIDDEN STRIPE WEBHOOK PAYLOAD]"
				}
				if (logFile) {
					// const msg = `${logItem.source} :: ${logItem.name}`
					// if (logItem.type == types.TypeLog.ERROR) {
					// 	logger.error(logItem.payload, msg)
					// } else {
					// 	logger.info(logItem.payload, msg)
					// }
				}
				return logTerminal
			}
		},

		{
			class: "email",
			name: "email-noreply",
			account: <emailNs.IAccount>{
				host: process.env.EMAIL_HOST,
				port: Number(process.env.EMAIL_PORT),
				secure: true,
				auth: {
					user: process.env.EMAIL_USER,
					pass: process.env.EMAIL_PASSWORD,
				}
			},
		},

		!noHttp && <http.conf>{
			class: "http",
			log: { body: true },
			port: port ?? PORT,
			children: [

				{
					class: "npm:@priolo/julian-mcp",
					tools: tools,
				},

				{ class: AuthRoute },
				{ class: AuthEmailRoute },
				{ class: AuthGithubRoute },
				{ class: AuthGoogleRoute },

				<httpRouter.jwt.conf>{
					class: "http-router/jwt",
					repository: "/typeorm/user",
					jwt: "/jwt",
					children: [

						<httpStatic.conf>{
							class: "http-static",
							dir: path.join(__dirname, "../jen-client/dist"),
							path: "/app/",
							spaFile: "index.html",
						},

						<httpRouter.conf>{
							class: "http-router",
							path: "/api",
							cors: {
								"origin": "*",
								// "allowedHeaders": "*",
								// "credentials": true,
							},
							children: [
								{ class: McpServerRoute },
								{ class: LlmRoute },
								{ class: ToolRoute },
								{ class: AgentRoute },
								// { class: AuthRoute },
								{ class: AccountRoute },
								//{ class: RoomRoute },
							],
						},

					]
				},

				noWs ? null : <ws.conf>{
					class: "ws",
					port: WS_PORT,
					jwt: "/jwt",
					onAuth: function (jwtPayload) {
						return jwtPayload != null
					},
					children: [
						// { class: "npm:@priolo/julian-ws-reflection" }
						<WSRoomsConf>{
							class: WSRoomsService
						},
						// <WSDocConf>{
						// 	class: WSDocService
						// }
					]
				}
			]
		},

		<typeorm.conf>{
			class: "typeorm",
			options: {
				...getDBConnectionConfig(),
			},
			children: [
				{
					name: "accounts",
					class: "typeorm/repo",
					model: AccountRepo,
				},
				{
					name: "mcp_servers",
					class: "typeorm/repo",
					model: McpServerRepo,
				},
				{
					name: "agents",
					class: "typeorm/repo",
					model: AgentRepo,
				},
				{
					name: "tools",
					class: "typeorm/repo",
					model: ToolRepo,
				},
				{
					name: "rooms",
					class: "typeorm/repo",
					model: RoomRepo,
				},
				{
					name: "llms",
					class: "typeorm/repo",
					model: LlmRepo,
				},
			],
		},

		<jwt.conf>{
			class: "jwt",
			secret: "secret_word!!!"
		},

	]
}

export default buildNodeConfig 