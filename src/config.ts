import { http, httpRouter, log, ServiceBase, typeorm, ws } from "@priolo/julian";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { AgentRepo } from './repository/Agent.js';
import { getDBConnectionConfig } from './repository/dbConfig.js';
import { LlmRepo } from "./repository/Llm.js";
import { RoomRepo } from "./repository/Room.js";
import { ToolRepo } from "./repository/Tool.js";
import AgentRoute from './routers/AgentRoute.js';
import { WSDocConf, WSDocService } from "./routers/DocsWSRoute.js";
import LlmRoute from "./routers/LlmRoute.js";
import { WSRoomsConf, WSRoomsService } from "./routers/RoomsWSRoute.js";
import ToolRoute from "./routers/ToolRoute.js";
import McpServerRoute from "./routers/McpServerRoute.js";
import { McpServerRepo } from "./repository/McpServer.js";
import tools from "./config_tools.js";



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const PORT = process.env.PORT || 3000;
export const PORT_WS = process.env.PORT_WS || 3010;

class MyStateClass extends ServiceBase {
	// definico lo STATE
	get stateDefault() {
		return {
			...super.stateDefault,
			text: "",
		}
	}
	// le ACTION di questo NODE
	get executablesMap() {
		return {
			...super.executablesMap,
			["set-text"]: (payload) => {
				this.setState({ text: payload })
				return "ok fatto!"
			}
		}
	}
}

const myState = new MyStateClass();

function buildNodeConfig() {

	return [

		<log.conf>{
			class: "log",
			onLog: (msg) => {
				if (msg.type == "error") {
					console.error(msg)
				}
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
						//{ class: RoomRoute },
					],
				},

				<ws.conf>{
					class: "ws",
					port: PORT_WS,
					children: [
						// { class: "npm:@priolo/julian-ws-reflection" }
						<WSRoomsConf>{
							class: WSRoomsService
						},
						<WSDocConf>{
							class: WSDocService
						}
					]
				}
			]
		},

		<typeorm.conf>{
			class: "typeorm",
			options: {
				...getDBConnectionConfig(),
				//entities: repositories
			},
			children: [
				{
					name: "mcp_servers",
					class: "typeorm/repo",
					model: McpServerRepo,
				},
				{
					name: "llm",
					class: "typeorm/repo",
					model: LlmRepo,
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
			],
		},

		// {
		// 	class: myState,
		// 	name: "node.1"
		// }

	]
}

export default buildNodeConfig 