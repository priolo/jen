import { ClientMessage, ClientMessageType, ClientObjects, ClientUpdateMessage, SlateApplicator } from "@priolo/jess"
import { Operation } from "slate"
import { wsConnection } from "../session"
import { SS_EVENT } from "../SocketService/types"



export const clientObjects = new ClientObjects()
clientObjects.apply = SlateApplicator.ApplyCommands
//clientObjects.onSend = async (messages) => cws.send(JSON.stringify(messages))
clientObjects.onSend = async (messages) => {
	const { msgGen, msgUpdatesMap } = splitMessages(messages)
	/** i messaggi UPDATE normalizzati */
	const mesUpNorm: ClientUpdateMessage[] = []

	for (const idObj in msgUpdatesMap) {
		const messagesUp = msgUpdatesMap[idObj]
		const commands = messagesUp.map(msg => msg.action.command)
		const commandsNorm = SlateApplicator.Normalize(commands)
		const msgUpdate: ClientUpdateMessage = {
			type: ClientMessageType.UPDATE,
			idObj: idObj,
			action: {
				idClient: messagesUp[0].action.idClient,
				counter: messagesUp[0].action.counter,
				command: commandsNorm,
			}
		}
		mesUpNorm.push(msgUpdate)
	}

	const allMessages = msgGen.concat(mesUpNorm)
	wsConnection.send(JSON.stringify(allMessages))
	console.log("socket::send", allMessages)
	return allMessages
}

/**
 * Divido il messaggi da UPDATE a non UPDATE e questi li raggruppo per idObject
 */
function splitMessages(messages: ClientMessage[]): { msgGen: ClientMessage[], msgUpdatesMap: { [idObj: string]: ClientUpdateMessage[] } } {
	/** tutti i messaggi che non sono UPDATE */
	const msgGen: ClientMessage[] = []
	/** tutti i messaggi UPDATE in dictionary per idObject */
	const msgUpdatesMap: { [idObj: string]: ClientUpdateMessage[] } = {}

	for (const message of messages) {
		if (message.type != ClientMessageType.UPDATE) {
			msgGen.push(message)
		} else {
			const idObj = message.idObj
			if (!msgUpdatesMap[idObj]) msgUpdatesMap[idObj] = []
			msgUpdatesMap[idObj].push(message)
		}
	}
	return { msgGen, msgUpdatesMap }
}



let idTimeout: NodeJS.Timeout
/** chiamato dal componente SLATE su "apply"
 * memorizzo dei COMMANDs e li invio quando tutto è calmo
 */
export function sendCommands(idDoc:string, operation: Operation) {
	if (Operation.isSelectionOperation(operation)) return
	clientObjects.command(idDoc, operation)
	clearTimeout(idTimeout)
	idTimeout = setTimeout(() => clientObjects.update(), 1000)
}





const onMessage = (data: any) => {
	clientObjects.receive(data.payload.toString())
}
// if (wsConnection.websocket?.readyState === WebSocket.OPEN) {
// 	wsConnection.emitter.on(SS_EVENT.MESSAGE, onMessage)
// }
wsConnection.emitter.on(SS_EVENT.CONNECTION, ({payload}:{payload:number}) => {
	if (payload == WebSocket.OPEN) {
		wsConnection.emitter.on(SS_EVENT.MESSAGE, onMessage)
	} else {
		wsConnection.emitter.off(SS_EVENT.MESSAGE, onMessage)
	}
})
// wsConnection.emitter.on(SS_EVENT.CLOSE, () => {
// 	wsConnection.emitter.off(SS_EVENT.MESSAGE, onMessage)
// })