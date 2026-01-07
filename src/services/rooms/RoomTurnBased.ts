import { randomUUID } from "crypto";
import { AgentRepo } from "../../repository/Agent.js";
import { RoomRepo } from "../../repository/Room.js";
import { ContentAskTo, ContentTool, LLM_RESPONSE_TYPE, LlmResponse } from '../../types/commons/LlmResponse.js';
import { ChatMessage, MessageUpdate, UPDATE_TYPE } from "../../types/commons/RoomActions.js";
import AgentLlm from "../agents/AgentLlm.js";
import { printLlmResponse } from "../agents/utils/print.js";



class RoomTurnBased {

	constructor(
		public room: RoomRepo,
		// [II] in room dovrebbero poterci essere dei TOOLS e dei CONTEXT condivisi per tutti gli AGENTS che partecipano
	) {
		if (!this.room.history) {
			this.room.history = [];
		}
	}


	/** aggiorno la HISTORY con una serie di MessageUpdate */
	updateHistory(updates: MessageUpdate[] | MessageUpdate): void {
		if (!updates) return;
		if (!Array.isArray(updates)) updates = [updates];
		if (updates.length == 0) return;

		const history = [...this.room.history]
		for (const update of updates) {
			if (update.type === UPDATE_TYPE.APPEND) {
				history.push(update.content)
				continue;
			}
			const index = history.findIndex(m => m.id == update.refId)
			switch (update.type) {
				case UPDATE_TYPE.ADD: {
					if (index == -1) {
						history.unshift(update.content)
					} else {
						history.splice(index + 1, 0, update.content)
					}
					break
				}
				case UPDATE_TYPE.DELETE: {
					if (index != -1) history.splice(index, 1)
					break
				}
				case UPDATE_TYPE.REPLACE: {
					if (index != -1) history[index] = update.content
					break
				}
			}
		}
		this.room.history = history
	}

	/**
	 * Costruisce un messaggio di tipo AGENT
	 */
	private static BuildAgentMessage(llmResponse: LlmResponse, clientId: string): ChatMessage {
		const msg: ChatMessage = {
			id: randomUUID(),
			clientId: clientId,
			role: "agent",
			content: llmResponse,
		}
		return msg;
	}

	/** 
	 * HOOK: Su utilizzo di un TOOL  
	 * Restituisce il risultato del TOOL
	 * */
	public onTool: (id: string, args: any) => Promise<any> = null

	/**
	 * HOOK: l'LLM ha deciso di chiedere ad un SUB-AGENT  
	 * Elaboro la domanda con il SUB-AGENT  
	 * e restituisco il risultato  
	 */
	public onSubAgent: (requestAgentId: string, responseAgentId: string, question: string) =>
		Promise<{ response: LlmResponse, roomId: string }> = null;

	/**
	 * HOOK: Chiamato quando l'AGENT risponde 
	 * e quindi si completa un ciclo del LOOP di risposte
	 */
	public onMessage: (chatMessage: ChatMessage, roomId: string) => void = null;


	




	public async getResponse(): Promise<LlmResponse> {
		return this.getResponseSerial()
		//return this.getResponseParallel()
	}


	/**
	 * Restituiese un LlmResponse dopo aver processato tutti i turni necessari
	 * ha degli "eventi" per gestire l'uso di tool o sub-agenti
	 */
	private async getResponseSerial(): Promise<LlmResponse> {
		if (this.room.agents.length == 0) return null

		const responses: LlmResponse[] = []
		let index = this.getStartIndex()

		for (let i = 0; i < this.room.agents.length; i++) {
			index = (index + 1) % this.room.agents.length
			const agentRepo = this.room.agents[index]
			const history = await this.getAgentResponse(agentRepo, this.room.history)
			responses.push(history[history.length - 1].content as LlmResponse)
		}

		return responses[responses.length - 1]
	}
	/**
	 * restituisco l'AGENT che deve rispondere al prossimo turno
	 */
	private getStartIndex(): number {
		const history = this.room.history?.filter(m => m.role != "user")
		const lastMessage = history?.[history.length - 1]
		if (!lastMessage) return -1

		const lastIndex = this.room.agents.findIndex(a => a.id == lastMessage.clientId)
		const nextIndex = (lastIndex + 1) % this.room.agents.length

		return nextIndex
	}

	/**
	 * metopdo alternativo cioe' la risposta è elaborata parallelamente da tutti gli AGENTS presenti in ROOM 
	 * e quindi le risposte vengono composte nella HISTORY
	 */
	private async getResponseParallel(): Promise<LlmResponse> {
		if (this.room.agents.length == 0) return null

		const startIndex = this.room.history.length

		const promises = this.room.agents.map(agentRepo => this.getAgentResponse(agentRepo, [...this.room.history]))
		const histories = await Promise.all(promises)

		for (const h of histories) {
			this.room.history.push(...h.slice(startIndex))
		}

		return this.room.history[this.room.history.length - 1].content as LlmResponse
	}








	private async getAgentResponse(agentRepo: AgentRepo, history: ChatMessage[]): Promise<ChatMessage[]> {
		if (!agentRepo) return null;

		// creo l'AGENT
		//const agent = agentRepo.type == AGENT_TYPE.MOCK ? new AgentMock(agentRepo) : new AgentLlm(agentRepo)
		const agent = new AgentLlm(agentRepo)

		// SYSTEM: se ci sono piu' agenti...
		if (this.room.agents.length > 1) {
			const agentsList = this.room.agents
				.filter(a => a.id != agent.agent.id)
				.map(a => a.name).join(", ")
			agent.overrideSystemPrompt = (systemPrompt: string) => {
				return `${systemPrompt}
You are agent named :${agent.agent.name}. 
You are participating in a multi-agent discussion.
The other agents involved in this discussion are: ${agentsList}.
When it's your turn, provide your response based on the conversation history.
`
			}
		}


		// LOOP
		let response: LlmResponse;
		do {
			response = await agent.ask(history)

			printLlmResponse(agent.agent.name, response)

			if (response.type === LLM_RESPONSE_TYPE.TOOL) {
				const content = <ContentTool>response.content
				const result = await this.onTool?.(content.toolId, content.args)
				content.result = result
			}

			if (response.type === LLM_RESPONSE_TYPE.ASK_TO) {
				const content = <ContentAskTo>response.content
				const subResponse = await this.onSubAgent?.(agent.agent.id, content.agentId, content.question)
				content.roomId = subResponse?.roomId
				content.result = subResponse?.response?.content?.result
			}

			const chatMessage = RoomTurnBased.BuildAgentMessage(response, agent.agent.id)
			history.push(chatMessage)
			this.onMessage?.(chatMessage, this.room.id)

		} while (response.continue)

		return history
	}




	//#region UTILS



	//#endregion

}

export default RoomTurnBased

