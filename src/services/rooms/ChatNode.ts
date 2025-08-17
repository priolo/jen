import { AgentRepo } from "@/repository/Agent.js";
import { RoomRepo } from "@/repository/Room.js";
import RoomsChats from "@/routers/RoomsChats.js";
import { AgentMessageS2C, BaseS2C, CHAT_ACTION_S2C, NewRoomS2C, UserEnteredS2C, UserMessageS2C } from "@/types/RoomActions.js";
import { ContentCompleted, LLM_RESPONSE_TYPE, LlmResponse } from '../agents/types.js';
import RoomTurnBased from "./RoomTurnBased.js";



class ChatNode {
	constructor(
		node: RoomsChats,
	) {
		this.node = node;
	}

	public id: string = crypto.randomUUID();
	private node: RoomsChats;
	private rooms: RoomTurnBased[] = []
	private clientsIds: Set<string> = new Set();


	//#region HANDLE CHAT OPERATIONS

	/**
	 * comunico alla chat che un client è entrato nella chat
	 */
	async enterClient(clientId: string, agentId: string): Promise<void> {
		// inserisco il client
		this.clientsIds.add(clientId);
		// creo una nuova room se non esiste
		let room: RoomTurnBased = this.getRootRoom()
		if (!room) {
			const roomRepo = await this.node.createRoomRepo()
			room = new RoomTurnBased(roomRepo)
			this.rooms.push(room);
		}
		// carico l'agente e lo inserisco nella room
		const agentRepo = await this.node.getAgentRepoById(agentId)
		if ( !agentRepo ) throw new Error(`Agent with id ${agentId} not found`);
		room.room.agents.push(agentRepo);

		// INVIO: creo e invio il messaggio di entrata
		const message: UserEnteredS2C = {
			action: CHAT_ACTION_S2C.ENTERED,
			chatId: this.id,
			roomId: room.room.id,
		}
		this.sendMessageToClients(message)
		// ---
	}

	/**
	 * comunico alla chat che un client ha lasciato la chat
	 * @return true se la chat è vuota e può essere rimossa
	 */
	removeClient(clientId: string): boolean {
		// INVIO
		const message: BaseS2C = {
			action: CHAT_ACTION_S2C.LEAVE,
			chatId: this.id,
		}
		this.sendMessageToClients(message)
		// ---

		this.clientsIds.delete(clientId);
		return this.clientsIds.size == 0
	}

	/**
	 * comunico alla chat che un client ha inserito un messaggio
	 */
	userMessage(clientId: string, question: string) {
		// assumo che un messaggio utente arrivi sempre nella main room
		let room: RoomTurnBased = this.getRootRoom()
		room.addUserMessage(question)

		// INVIO
		const msgToClient: UserMessageS2C = {
			action: CHAT_ACTION_S2C.USER_MESSAGE,
			chatId: this.id,
			content: { role: "user", content: question },
		}
		this.sendMessageToClients(msgToClient)
		// ---
	}

	async complete(): Promise<LlmResponse> {
		// assumo che da completare sia sempre la root room
		let room: RoomTurnBased = this.getRootRoom()
		return await this.recursiveRequest(room)
	}

	//#endregion





	private async recursiveRequest(room: RoomTurnBased, question?: string): Promise<LlmResponse> {

		room.onTool = async (toolId: string, args: any) => {
			return this.node.executeTool(toolId, args)
		}
		room.onSubAgent = async (agentId, question) => {

			// recupero il sub-agente dal DB
			const agentRepo: AgentRepo = await this.node.getAgentRepoById(agentId)
			if (!agentRepo) return null;

			// creo una nuova room per il sub-agente
			const subRoomRepo: RoomRepo = await this.node.createRoomRepo([agentRepo], room.room.id)
			const subRoom = new RoomTurnBased(subRoomRepo)
			this.rooms.push(subRoom);

			// invia la nuova ROOM-AGENT al CLIENT
			const newRoomMsg: NewRoomS2C = {
				action: CHAT_ACTION_S2C.NEW_ROOM,
				chatId: this.id,
				roomId: subRoom.room.id,
				parentRoomId: room.room.id,
				agentId: agentRepo.id,
			}
			this.sendMessageToClients(newRoomMsg)

			// effettuo la ricorsione su questa nuova ROOM-AGENT
			const llmResponse = await this.recursiveRequest(subRoom, question)
			if (llmResponse.type != LLM_RESPONSE_TYPE.COMPLETED) return null
			return (<ContentCompleted>llmResponse.content).answer
		}
		room.onLoop = (roomId: string, agentId: string, response: LlmResponse) => {
			// INVIO
			const msgToClient: AgentMessageS2C = {
				action: CHAT_ACTION_S2C.AGENT_MESSAGE,
				chatId: this.id,
				agentId: agentId,
				roomId: roomId,
				content: response,
			}
			this.sendMessageToClients(msgToClient)
			// ---
		}
		if (!!question) room.addUserMessage(question)

		return await room.getResponse()
	}

	private getRootRoom(): RoomTurnBased {
		return this.rooms.find(room => room.room.parentRoomId == null)
	}

	private sendMessageToClients(message: BaseS2C): void {
		for (const clientId of this.clientsIds) {
			this.node.sendMessageToClient(clientId, message)
		}
	}


}

export default ChatNode