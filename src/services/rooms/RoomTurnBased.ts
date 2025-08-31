import { RoomRepo } from "@/repository/Room.js";
import { ChatMessage } from "@/types/commons/RoomActions.js";
import { randomUUID } from "crypto";
import AgentLlm from "../agents/AgentLlm.js";
import { ContentAskTo, ContentTool, LLM_RESPONSE_TYPE, LlmResponse } from '../../types/commons/LlmResponse.js';
import { printLlmResponse } from "../agents/utils/print.js";
import { AGENT_TYPE } from "@/repository/Agent.js";
import AgentMock from "../agents/AgentMock.js";
import { updateVercelToolResponse } from "../agents/utils/vercel.js";



class RoomTurnBased {

	constructor(
		public room: Partial<RoomRepo>,
	) {
		if (!this.room.history) {
			this.room.history = [];
		}
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
	public onSubAgent: (requestAgentId:string, responseAgentId: string, question: string) => Promise<any> = null;

	/**
	 * Chiamato quando l'AGENT risponde e quindi si completa un ciclo del LOOP di risposte
	 */
	public onMessage: ( chatMessage: ChatMessage, roomId: string) => void = null;

	
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
	 * Restituiese un LlmResponse dopo aver processato tutti i turni necessari
	 * ha degli "eventi" per gestire l'uso di tool o sub-agenti
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
				updateVercelToolResponse(response.responseRaw, result)
			}

			if (response.type === LLM_RESPONSE_TYPE.ASK_TO) {
				const content = <ContentAskTo>response.content
				const result = await this.onSubAgent?.(agent.agent.id, content.agentId, content.question)
				
				content.result = result
				updateVercelToolResponse(response.responseRaw, result)
			}

			const chatMessage = this.addAgentMessage(response, agent.agent.id)
			this.onMessage?.(chatMessage, this.room.id )

		} while (response.continue)

		return response
	}

}

export default RoomTurnBased

