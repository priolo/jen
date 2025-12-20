import { AgentRepo } from "@/repository/Agent.js";
import { RoomRepo } from "@/repository/Room.js";
import { ChatMessage } from "@/types/commons/RoomActions.js";
import { randomUUID } from "crypto";
import { ContentAskTo, ContentTool, LLM_RESPONSE_TYPE, LlmResponse } from '../../types/commons/LlmResponse.js';
import AgentLlm from "../agents/AgentLlm.js";
import AgentMock from "../agents/AgentMock.js";
import { printLlmResponse } from "../agents/utils/print.js";
import ChatContext from "./ChatContext.js";



class RoomTurnBased {

	constructor(
		public room: Partial<RoomRepo>,
	) {
		if (!this.room.history) {
			this.room.history = [];
		}
	}

	/**
	 * Crea una MAIN-ROOM con gli AGENTs specificati
	 */
	static async Build(node: ChatContext, agentsIds: string[] = []): Promise<RoomTurnBased> {
		// carico gli agenti REPO
		const agentsRepo: AgentRepo[] = []
		for (const agentId of agentsIds) {
			const agentRepo = await node.getAgentRepoById(agentId)
			if (agentRepo) agentsRepo.push(agentRepo)
		}
		// creo una nuova MAIN-ROOM
		const roomRepo = await node.createRoomRepo(agentsRepo, null)
		const room = new RoomTurnBased(roomRepo)
		return room
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


	/**
	 * Inserisce in HISTORY un messaggio di tipo UTENTE
	 * con clientId = null è GENERIC-USER
	 */
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

		for ( const h of histories) {
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

