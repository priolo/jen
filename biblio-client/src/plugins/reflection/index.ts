import { NodeStruct } from "../../stores/stacks/reflection/types"
import { SocketService } from "../SocketService"
import { EventEmitter } from "@priolo/jon-utils/dist"
import { chainByPath, nodeByPath, updatePath } from "./utils"
import { ClientMessage, ClientMessageType, NamesLog, ServerLogMessage, ServerMessage, ServerMessageType } from "./types"



export class ReflectionService {

	constructor() {
		this.emitter = new EventEmitter()
	}

	ws: SocketService = null
	emitter: EventEmitter = null
	root: NodeStruct = null



	emitRoot() {
		this.emitter.emit("root", this.root)
	}

	async connect() {
		if (this.ws) return
		this.ws = new SocketService({
			protocol: window.location.protocol == "http:" ? "ws:" : "wss:",
			host: window.location.hostname,
			port: 3000, //import.meta.env.VITE_API_WS_PORT ?? window.location.port,
			base: "",
		})
		this.ws.emitter.on('connection', (event) => {
			this.emitter.emit('connection', event.payload)
		})
		this.ws.emitter.on("message", this.handleMessage)

		await this.ws.connectAndWait()
		//this.ws.connect()
	}

	async sendGetStruct(): Promise<NodeStruct | null> {
		if (this.root) return this.root

		const clientMsg = JSON.stringify(<ClientMessage>{
			type: ClientMessageType.GET_STRUCT,
			payload: { path: "/" }
		})
		const responseStr = await this.ws.sendAndWait(
			clientMsg,
			data => JSON.parse(data)?.type == ServerMessageType.STRUCT
		)
		const response: ServerMessage = JSON.parse(responseStr)
		this.root = updatePath(response?.payload)
		this.emitRoot()
		return this.root
	}

	async sendAction(path: string, action: string, payload: any): Promise<any> {
		const clientMsg = JSON.stringify(<ClientMessage>{
			type: ClientMessageType.EXECUTE_ACTION,
			payload: {
				path,
				action: { type: action, payload }
			}
		})
		const responseStr = await this.ws.sendAndWait(
			clientMsg,
			data => JSON.parse(data)?.type == ServerMessageType.ACTION_RESULT
		)
		return JSON.parse(responseStr)
	}

	handleMessage(data: any) {
		const msg: ServerMessage = JSON.parse(data)
		console.log("socket::receive", msg)
		switch (msg.type) {
			case ServerMessageType.LOG: {
				const msgLog: ServerLogMessage = msg as ServerLogMessage
				switch (msgLog.name) {

					case NamesLog.STATE_CHANGED: {
						const target = nodeByPath(this.root, msgLog.source)
						if (!target) return
						target.state = { ...target.state, ...msgLog.payload }
						this.emitRoot()
						break
					}

					case NamesLog.NODE_DELETED: {
						const chain = chainByPath(this.root, msgLog.source)
						if (chain.length == 0) return
						const node = chain[chain.length - 1]
						const parent = chain[chain.length - 2]
						parent.children = parent.children.filter(c => c != node)
						this.emitRoot()
						break
					}
				}


			}
		}
	}
}

const reflectionService = new ReflectionService()
reflectionService.connect()
export default reflectionService
