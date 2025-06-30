import { ws } from "@priolo/julian"
import { ServerObjects, SlateApplicator, TextApplicator } from "@priolo/jess";



const server = new ServerObjects()
server.apply = SlateApplicator.ApplyCommands
let timeoutId: any = null


export type WSDocConf = Partial<WSDocService['stateDefault']>

/**
 * WebSocket service for managing prompt chat rooms
 */
export class WSDocService extends ws.route {

	get stateDefault() {
		return {
			...super.stateDefault,
			name: "ws-docs",
			repository: "/typeorm/docs",
		}
	}

	protected onInit(): Promise<void> {
		server.onSend = async (client: ws.IClient, message) => this.sendToClient(client, JSON.stringify(message))
		return super.onInit()
	}

	async onConnect(client: ws.IClient) {
		// qua posso mettere tutti i dati utili al client
		console.log(`Client connected: ${client.remoteAddress}`)
		super.onConnect(client)
	}

	/**
	 * Handle incoming WebSocket messages
	 */
	async onMessage(client: ws.IClient, message: string) {
		const messages = JSON.parse(message)
		// [II] per il momento discrimino solo per messaggi array. Devo trovare una soluzione migliore
		if (!Array.isArray(messages)) return
		server.receiveMessages(messages, client)
		clearTimeout(timeoutId)
		timeoutId = setTimeout(() => server.update(), 1000)
		super.onMessage(client, message)
	}

	/**
	 * Handle client disconnection
	 */
	onDisconnect(client: ws.IClient) {
		console.log("ws/route onDisconnect")
		server.disconnect(client)
		super.onDisconnect(client)
	}

}
