import { RoomRepo } from "@/repository/Room.js";
import { ChatMessage } from "@/types/commons/RoomActions.js";
import { randomUUID } from "crypto";
import AgentLlm from "../agents/AgentLlm.js";
import { ContentAskTo, ContentTool, LLM_RESPONSE_TYPE, LlmResponse } from '../agents/types.js';



class RoomTurnBased {

	constructor(
		public room: Partial<RoomRepo>,
	) {
	}

	/** 
	 * Su utilizzo di un TOOL 
	 * Restituisce il risultato del tool
	 * */
	public onTool: (id:string, args: any) => Promise<any> = null

	/**
	 * Su utilizzo di un sub-agente
	 * Restituisce il risultato della domanda al sub-agente
	 */
	public onSubAgent: (agentId: string, question: string) => Promise<any> = null;

	public onLoop: (roomId:string, agentId: string, llmResponse: LlmResponse) => void = null;

	public addUserMessage(message: string) {
		if (!this.room.history) {
			this.room.history = [];
		}
		const msg: ChatMessage = { 
			id: randomUUID(),
			role: "user", 
			content: message, 
		}
		this.room.history.push(msg)
	}

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
				const toolContent = response.responseRaw.find(r => r.role == "tool")?.content?.find( c => c.type == "tool-result")
				toolContent.result = result;
			}

			if (response.type === LLM_RESPONSE_TYPE.ASK_TO) {
				const content = <ContentAskTo>response.content
				const result = await this.onSubAgent?.(content.agentId, content.question)
				content.result = result
				// inserisco il risultato nel RAW "tool-result"
				const toolContent = response.responseRaw.find(r => r.role == "tool")?.content?.find( c => c.type == "tool-result")
				toolContent.result = result;
			}

			this.room.history.push(...response.responseRaw)

			this.onLoop?.(this.room.id, agent.agent.id, response)

		} while (response.continue)

		return response
	}

}

export default RoomTurnBased