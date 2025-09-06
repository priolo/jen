import { AGENT_TYPE, AgentRepo } from "@/repository/Agent.js";
import { RoomRepo } from "@/repository/Room.js";
import { ChatMessage } from "@/types/commons/RoomActions.js";
import { randomUUID } from "crypto";
import { ContentAskTo, ContentCompleted, ContentTool, LLM_RESPONSE_TYPE, LlmResponse } from '../../types/commons/LlmResponse.js';
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
	 * restituisco l'AGENT che deve rispondere al prossimo turno
	 */
	private getNextTurn(): number {
		const history = this.room.history?.filter(m => m.role != "user")
		const lastMessage = history?.[history.length - 1]
		if (!lastMessage) return 0

		const lastIndex = this.room.agents.findIndex(a => a.id == lastMessage.clientId)
		const nextIndex = (lastIndex + 1) % this.room.agents.length

		return nextIndex
	}


	/**
	 * Restituiese un LlmResponse dopo aver processato tutti i turni necessari
	 * ha degli "eventi" per gestire l'uso di tool o sub-agenti
	 */
	public async getResponse(): Promise<LlmResponse> {
		if (this.room.agents.length == 0) return null

		let nextIndex: number
		do {
			nextIndex = this.getNextTurn()
			const agentRepo = this.room.agents[nextIndex]
			const response = await this.getAgentResponse(agentRepo)
			console.log(`[RoomTurnBased] Agent ${agentRepo.name} has responded`)
		} while (nextIndex < this.room.agents.length - 1)

		return null

	}

	private async getAgentResponse(agentRepo: AgentRepo): Promise<LlmResponse> {
		if (!agentRepo) return null;

		//const agent = agentRepo.type == AGENT_TYPE.MOCK ? new AgentMock(agentRepo) : new AgentLlm(agentRepo)
		const agent = new AgentLlm(agentRepo)

		// se ci sono piu' agenti...
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


		let response: LlmResponse;

		do {
			response = await agent.ask(this.room.history)

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
				content.result = (<ContentCompleted>subResponse?.response?.content)?.result
			}

			const chatMessage = this.addAgentMessage(response, agent.agent.id)
			this.onMessage?.(chatMessage, this.room.id)

		} while (response.continue)

		return response
	}




	//#region UTILS



	//#endregion

}

export default RoomTurnBased

