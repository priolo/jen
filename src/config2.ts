
import { getDBConnectionConfig } from "./repository/dbConfig.js";
import UserRoute from "./routers/UserRoute.js";
import AuthRoute from "./routers/AuthRoute.js";
import DocRoute from "./routers/DocRoute.js";
import { User } from "./repository/User.js";
import { Provider } from "./repository/Provider.js";
import { Doc } from "./repository/Doc.js";
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { httpRouter, http, httpStatic, ws, typeorm } from "typexpress"
import { IClient } from "typexpress/dist/services/ws/utils.js";
import { ServerObjects, SlateApplicator, TextApplicator } from "@priolo/jess";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const PORT = process.env.PORT || 3000;

const server = new ServerObjects()
server.apply = SlateApplicator.ApplyCommands
let timeoutId: any = null

function buildNodeConfig() {

	return [
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
						{ class: UserRoute },
						{ class: DocRoute },
						{ class: AuthRoute },
						{
							class: "http-router",
							path: "/test",
							routers: [
								{ method: (req, res, next) => res.json({ data: "debug:reset:ok" }) },
							]
						},
					]
				},
				<httpStatic.conf>{
					class: "http-static",
					path: "/app",
					dir: path.join(__dirname, "../biblio-client/dist"),
					spaFile: "index.html",
				},
				<ws.conf>{
					class: "ws",
					onInit: function (this: ws.Service) {
						console.log("ws/route onInit")
						server.onSend = async (client: IClient, message) => this.sendToClient(client, JSON.stringify(message))
					},
					// un povero client s'e' connesso
					onConnect: function (client: IClient) {
						console.log("ws/route onConnect")
					},
					onMessage: function (client: IClient, message: string) {
						console.log("ws/route onMessage", message)
						server.receive(message.toString(), client)
						clearTimeout(timeoutId)
						timeoutId = setTimeout(() => server.update(), 1000)
					},
					onDisconnect: function (client: IClient) {
						console.log("ws/route onDisconnect")
						server.disconnect(client)
					}
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
					name: "users",
					class: "typeorm/repo",
					model: User,
				},
				{
					name: "providers",
					class: "typeorm/repo",
					model: Provider,
				},
				{
					name: "docs",
					class: "typeorm/repo",
					model: Doc,
				}
				// userRepo,
				// providerRepo,
				// docRepo,
			],
		},
		{
			class: "jwt",
			secret: "secret_word!!!"
		},
		{
			class: "log"
		}
	]
}



export default buildNodeConfig

export function pippo() {
	return true
}
// let timeoutIDs = {};

// /**
//  * attende un determinato tempo prima di eseguire una funzione
//  * se la funzione è richiamata resetta il tempo e riaspetta
//  */
// export function debounce(name, callback, delay=0) {
// 	if (delay == 0) {
// 		callback.apply(this, null);
// 	} else {
// 		let toId = timeoutIDs[name];
// 		if (toId != null) clearTimeout(toId);
// 		timeoutIDs[name] = setTimeout(() => {
// 			delete timeoutIDs[name];
// 			callback.apply(this, null);
// 		}, delay);
// 	}
// }