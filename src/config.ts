import { http, httpRouter, log, ServiceBase, typeorm, ws } from "@priolo/julian";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { Agent } from './repository/Agent.js';
import { getDBConnectionConfig } from './repository/dbConfig.js';
import { Llm } from "./repository/Llm.js";
import { Room } from "./repository/Room.js";
import { Tool } from "./repository/Tool.js";
import AgentRoute from './routers/AgentRoute.js';
import { WSDocConf, WSDocService } from "./routers/DocsWSRoute.js";
import LlmRoute from "./routers/LlmRoute.js";
import { WSRoomsConf, WSRoomsService } from "./routers/RoomsWSRoute.js";
import ToolRoute from "./routers/ToolRoute.js";
import McpServerRoute from "./routers/McpServerRoute.js";
import { McpServer } from "./repository/McpServer.js";



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const PORT = process.env.PORT || 3000;

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
					tools: [
						{
							name: "sum",
							config: {
								title: "Tool Somma",
								description: "Esegue la somma di due numeri",
								inputSchema: {
									type: "object",
									properties: {
										a: { type: "number" },
										b: { type: "number" }
									},
									required: ["a", "b"]
								}
							},
							execute: async (args: { a: number, b: number }, extra: any) => {
								return {
									content: [
										{
											type: "text" as const,
											text: String(args.a + args.b)
										}
									]
								}
							}
						}
					],
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
					port: 3100,
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
					model: McpServer,
				},
				{
					name: "llm",
					class: "typeorm/repo",
					model: Llm,
				},
				{
					name: "agents",
					class: "typeorm/repo",
					model: Agent,
				},
				{
					name: "tools",
					class: "typeorm/repo",
					model: Tool,
				},
				{
					name: "rooms",
					class: "typeorm/repo",
					model: Room,
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