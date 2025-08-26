import { RoomRepo } from "@/repository/Room.js";
import { ChatMessage } from "@/types/commons/RoomActions.js";
import { randomUUID } from "crypto";
import AgentLlm from "../agents/AgentLlm.js";
import { ContentAskTo, ContentTool, LLM_RESPONSE_TYPE, LlmResponse } from '../../types/commons/LlmResponse.js';



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
	public onSubAgent: (agentId: string, question: string) => Promise<any> = null;

	public onLoop: (roomId: string, agentId: string, chatMessage: ChatMessage) => void = null;

	public addUserMessage(message: string) {
		const msg: ChatMessage = {
			id: randomUUID(),
			role: "user",
			content: message,
		}
		this.room.history.push(msg)
	}

	/**
	 * Restituiese un LlmResponse dopo aver processato tutti i turni necessari
	 * ha degli "eventi" per gestire l'uso di tool o sub-agenti
	 */
	public async getResponse(): Promise<LlmResponse> {
		// [II] per il momento suppongo che ci sia un solo AGENT
		const agent = new AgentLlm(this.room.agents?.[0])
		let response: LlmResponse;
		do {
			response = await agent.ask(this.room.history)

			if (response.type === LLM_RESPONSE_TYPE.TOOL) {
				const content = <ContentTool>response.content
				const result = await this.onTool?.(content.toolId, content.args)
				content.result = result

				// inserisco il risultato nel RAW "tool-result"
				// [II] fare utils
				const toolContent = response.responseRaw.find(r => r.role == "tool")?.content?.find(c => c.type == "tool-result")
				toolContent.result = result;
				if (toolContent) {
					toolContent.output = {
						type: (typeof result) == "object" ? "json" : "text",
						value: result,
					}
				}
			}

			if (response.type === LLM_RESPONSE_TYPE.ASK_TO) {
				const content = <ContentAskTo>response.content
				const result = await this.onSubAgent?.(content.agentId, content.question)
				content.result = result
				// inserisco il risultato nel RAW "tool-result"
				const toolContent = response.responseRaw.find(r => r.role == "tool")?.content?.find(c => c.type == "tool-result")
				toolContent.result = result;
			}

			//this.room.history.push(...response.responseRaw)
			// [II] fare utils
			const chatMessage:ChatMessage = { id: randomUUID(), role: "agent", content: response }
			this.room.history.push(chatMessage)

			this.onLoop?.(this.room.id, agent.agent.id, chatMessage)

		} while (response.continue)

		return response
	}

}

export default RoomTurnBased