import { dirname } from 'path';
import { http, ws, log, NodeConf, ServiceBase } from "@priolo/julian";
import { fileURLToPath } from 'url';
import * as wsRef from "@priolo/julian-ws-reflection";



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

		<log.conf>{ class: "log" },

		<http.conf>{
			class: "http",
			port: PORT,
			children: [
				<ws.conf>{
					class: "ws",
					children: [
						//{ class: "npm:@priolo/julian-ws-reflection" }
						<wsRef.conf>{ class: wsRef.Service }
					]
				}
			]
		},

		{
			class: myState,
			name: "node.1"
		}

	]
}

export default buildNodeConfig 