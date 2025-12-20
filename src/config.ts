import { http, httpRouter, jwt, log, typeorm, ws } from "@priolo/julian";
import { TypeLog } from "@priolo/julian/dist/core/types.js";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import tools from "./config_tools.js";
import { AccountRepo } from "./repository/Account.js";
import { AgentRepo } from './repository/Agent.js';
import { LlmRepo } from './repository/Llm.js';
import { McpServerRepo } from "./repository/McpServer.js";
import { RoomRepo } from "./repository/Room.js";
import { ToolRepo } from "./repository/Tool.js";
import AccountRoute from "./routers/AccountRoute.js";
import AgentRoute from './routers/AgentRoute.js';
import AuthRoute from "./routers/AuthRoute.js";
import McpServerRoute from "./routers/McpServerRoute.js";
import ProviderRoute from "./routers/ProviderRoute.js";
import { WSRoomsConf, WSRoomsService } from "./routers/RoomsWSRoute.js";
import ToolRoute from "./routers/ToolRoute.js";
import { getDBConnectionConfig } from './startup/dbConfig.js';



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const PORT = process.env.PORT || 3000;
export const WS_PORT = +(process.env.WS_PORT || 3010)

// class MyStateClass extends ServiceBase {
// 	// definico lo STATE
// 	get stateDefault() {
// 		return {
// 			...super.stateDefault,
// 			text: "",
// 		}
// 	}
// 	// le ACTION di questo NODE
// 	get executablesMap() {
// 		return {
// 			...super.executablesMap,
// 			["set-text"]: (payload) => {
// 				this.setState({ text: payload })
// 				return "ok fatto!"
// 			}
// 		}
// 	}
// }




function buildNodeConfig(noWs: boolean = false, noLog: boolean = false) {

	return [

		<log.conf>{
			class: "log",
			exclude: [TypeLog.SYSTEM],
			onParentLog: (log) => {
				if (!!log?.payload && ['nc:init', 'nc:destroy', "ns:set-state"].includes(log.payload.type)) return false
			}
		},

		<http.conf>{
			class: "http",
			port: PORT,
			children: [

				{
					class: "npm:@priolo/julian-mcp",
					tools: tools,
				},

				{ class: AuthRoute },

				<httpRouter.jwt.conf>{
					class: "http-router/jwt",
					repository: "/typeorm/user",
					jwt: "/jwt",
					children: [

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
								{ class: ProviderRoute },
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
				...getDBConnectionConfig(noLog),
				//entities: repositories
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