import { EventEmitter } from "@priolo/jon-utils";
import { Reconnect } from "./reconnect.js";
import { SocketOptions } from "./types.js";



/**
 * Crea una connessione WS
 * [II] mttere in jon-utils
 */
export class SocketService {

	constructor(options: SocketOptions) {
		this.options = options
		this.websocket = null
		this.reconnect = new Reconnect(this)
		this.emitter = new EventEmitter()
	}

	options: SocketOptions;
	websocket: WebSocket
	/** modulo per la riconnessione */
	reconnect: Reconnect
	emitter: EventEmitter

	/** 
	 * tenta di aprire il socket
	 */
	connect() {
		if (this.websocket) return
		const { protocol, host, port, base } = this.options
		this.reconnect.enabled = true
		try {
			let url = `${protocol}//${host}:${port}/`
			if (base) url = `${url}/${base}`
			this.websocket = new WebSocket(url);
		} catch (error) {
			this.reconnect.start()
			console.error(error)
			return
		}

		this.websocket.addEventListener("open",  this.handleOpen)
		this.websocket.addEventListener("close",  this.handleClose)
		this.websocket.addEventListener("message",  this.handleMessage)
		this.websocket.addEventListener("error",  this.handleError)
		
		this.emitter.emit("connection", this.websocket.readyState)
	}

	/** 
	 * libera tutte le risorse
	 */
	clear() {
		if (!this.websocket) return
		this.websocket.close()
		this.websocket.removeEventListener("open",  this.handleOpen)
		this.websocket.removeEventListener("close",  this.handleClose)
		this.websocket.removeEventListener("message",  this.handleMessage)
		this.websocket.removeEventListener("error",  this.handleError)
		this.websocket = null
	}

	/** 
	 * chiude il socket e mantiene chiuso (usato nel logout)
	 */
	disconnect() {
		this.reconnect.enabled = false
		this.reconnect.stop()
		this.clear()
	}

	/** 
	 * invia un messaggio al server
	 */
	send(msg: string) {
		this.websocket.send(msg)
	}

	//#region SOCKET EVENT

	handleOpen = (_: Event) => {
		console.log("socket:open")
		this.emitter.emit("connection", this.websocket.readyState)
		this.reconnect.stop()
		this.reconnect.tryZero()
	}

	handleClose = (_: CloseEvent) => {
		console.log("socket:close")
		this.emitter.emit("connection", this.websocket.readyState)
		this.clear()
		this.reconnect.start()
	}

	handleMessage = (event: MessageEvent) => {
		console.log("socket:message")
		this.emitter.emit("message", event.data)
	}

	handleError = (event: Event) => {
		console.error("socket:error")
		//this.reconnect.start()
		this.emitter.emit("error", event)
	}

	//#endregion

	async connectAndWait(): Promise<void> {
		return new Promise((resolve, reject) => {
			const cb = () => {
				this.websocket.removeEventListener("open", cb)
				resolve()
			}
			try {
				this.connect()
			} catch (error) {
				reject(error)
			}
			this.websocket.addEventListener("open", cb)
		})
	}

	async sendAndWait(msg: string, callback: (data: any) => boolean, timeout: number = 5000): Promise<any> {
		return new Promise<MessageEvent>((resolve, reject) => {

			const cb = (event: MessageEvent) => {
				if (!callback(event.data)) return
				this.websocket.removeEventListener("message", cb)
				clearTimeout(timeoutId)
				resolve(event.data)
			}

			this.websocket.addEventListener("message", cb)
			this.send(msg)

			const timeoutId = setTimeout(() => {
				this.websocket.removeEventListener("message", cb)
				clearTimeout(timeoutId)
				reject()
			}, timeout);
		})
	}
}


