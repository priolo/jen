import { http, httpRouter, log, ServiceBase, typeorm } from "@priolo/julian";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { Agent } from './repository/Agent.js';
import { getDBConnectionConfig } from './repository/dbConfig.js';
import AgentRoute from './routers/AgentRoute.js';
import { Tool } from "./repository/Tool.js";
import { Llm } from "./repository/Llm.js";
import { Prompt } from "./repository/Prompt.js";
import LlmRoute from "./routers/LlmRoute.js";
import ToolRoute from "./routers/ToolRoute.js";
import PromptRoute from "./routers/PromptRoute.js";



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
				if ( msg.type == "error") {
					console.error(msg)
				}
			}
		},

		<http.conf>{
			class: "http",
			port: PORT,
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
						{ class: AgentRoute },
						{ class: LlmRoute },
						{ class: ToolRoute },
						{ class: PromptRoute },
					],
				}

				// <ws.conf>{
				// 	class: "ws",
				// 	children: [
				// 		//{ class: "npm:@priolo/julian-ws-reflection" }
				// 		<wsRef.conf>{ class: wsRef.Service }
				// 	]
				// }
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
					name: "prompts",
					class: "typeorm/repo",
					model: Prompt,
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