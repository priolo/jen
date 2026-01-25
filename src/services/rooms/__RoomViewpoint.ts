import { AGENT_TYPE, AgentRepo } from "@/repository/Agent.js";
import { RoomRepo } from "@/repository/Room.js";
import { ChatsWSService } from "@/routers/ChatsWSRoute.js";
import { ChatMessage } from "@/types/commons/RoomActions.js";
import { randomUUID } from "crypto";
import { ContentAskTo, ContentTool, LLM_RESPONSE_TYPE, LlmResponse } from '../../types/commons/LlmResponse.js';
import AgentLlm from "./AgentLlm.js";
import AgentMock from "../agents/AgentLlm.mock.js";
import { printLlmResponse } from "../agents/utils/print.js";



class RoomViewpoint {

	constructor(
		public room: Partial<RoomRepo>,
	) {
		if (!this.room.history) {
			this.room.history = [];
		}
	}

	static async Build(node: ChatsWSService, agentsIds: string[]): Promise<RoomViewpoint> {
		// carico gli agenti REPO
		const agentsRepo: AgentRepo[] = []
		for (const agentId of agentsIds) {
			const agentRepo = await node.getAgentRepoById(agentId)
			if (agentRepo) agentsRepo.push(agentRepo)
		}
		// creo una nuova MAIN-ROOM
		const roomRepo = await node.createRoomRepo(agentsRepo, null)
		const room = new RoomViewpoint(roomRepo)
		return room
	}


	/** 
	 * Su utilizzo di un TOOL 
	 * Restituisce il risultato del tool
	 * */
	public onTool: (id: string, args: any) => Promise<any> = null

	/**
	 * Su utilizzo di un sub-agente
	 * Restituisce il risultato della domanda al sub-agente
	 */
	public onSubAgent: (requestAgentId: string, responseAgentId: string, question: string) =>
		Promise<{ response: LlmResponse, roomId: string }> = null;

	/**
	 * Chiamato quando l'AGENT risponde e quindi si completa un ciclo del LOOP di risposte
	 */
	public onMessage: (chatMessage: ChatMessage, roomId: string) => void = null;


	public addUserMessage(message: string, clientId?: string): ChatMessage {
		const msg: ChatMessage = {
			id: randomUUID(),
			clientId: clientId,
			role: "user",
			content: message,
		}
		this.room.history.push(msg)
		return msg;
	}

	private addAgentMessage(llmResponse: LlmResponse, clientId: string): ChatMessage {
		const msg: ChatMessage = {
			id: randomUUID(),
			clientId: clientId,
			role: "agent",
			content: llmResponse,
		}
		this.room.history.push(msg)
		return msg;
	}


	/**
	 * [II] deo prendere gli AGENTS e trasformare la HISTORY inbase al turno del corrente AGENT
	 * In maniera che possano essere usati piu' AGENT in una ROOM
	 */
	public async getResponse(): Promise<LlmResponse> {
		// [II] per il momento suppongo che ci sia un solo AGENT
		// ricavo l'AGENT che deve rispondere
		const agentRepo = this.room.agents?.[0]
		const agent = agentRepo.type == AGENT_TYPE.MOCK ? new AgentMock(agentRepo) : new AgentLlm(agentRepo)

		let response: LlmResponse;
		do {
			response = await agent.ask(this.room.history)

			printLlmResponse(agent.agent.name, response)

			if (response.type === LLM_RESPONSE_TYPE.TOOL) {
				const content = <ContentTool>response.content
				const result = await this.onTool?.(content.toolId, content.args)
				content.result = result
				//updateVercelToolResponse(response.responseRaw, result)
			}

			if (response.type === LLM_RESPONSE_TYPE.ASK_TO) {
				const content = <ContentAskTo>response.content
				const subResponse = await this.onSubAgent?.(agent.agent.id, content.agentId, content.question)
				content.roomId = subResponse?.roomId
				content.result = subResponse?.response?.content?.result
				//updateVercelToolResponse(response.responseRaw, content.result)
			}

			const chatMessage = this.addAgentMessage(response, agent.agent.id)
			this.onMessage?.(chatMessage, this.room.id)

		} while (response.continue)

		return response
	}

}

export default RoomViewpoint

