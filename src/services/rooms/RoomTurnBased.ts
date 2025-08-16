import { RoomRepo } from "@/repository/Room.js";
import { ChatMessage } from "@/types/RoomActions.js";
import AgentLlm from "../agents/AgentLlm.js";
import { ContentAskTo, ContentTool, Response, RESPONSE_TYPE } from '../agents/types.js';
import { tool, ToolResultPart } from "ai";



class RoomTurnBased {

	constructor(
		public room: Partial<RoomRepo>,
	) {
	}

	public onTool: (id:string, args: any) => Promise<any> = null

	public onSubAgent: (agentId: string, question: string) => Promise<any> = null;

	public onLoop: (roomId:string, agentId: string, result: any) => void = null;

	public addUserMessage(message: string) {
		if (!this.room.history) {
			this.room.history = [];
		}
		const msg: ChatMessage = { role: "user", content: message, }
		this.room.history.push(msg)
	}

	public async getResponse(): Promise<Response> {
		const agent = new AgentLlm(this.room.agents?.[0])
		let response: Response;
		do {
			response = await agent.ask(this.room.history)
			this.room.history.push(...response.response)

			if (response.type === RESPONSE_TYPE.TOOL) {
				const content = <ContentTool>response.content
				const result = await this.onTool?.(content.id, content.args)
				// inserisco il risultato nel "tool-result"
				const toolContent = response.response.find(r => r.role == "tool")?.content?.find( c => c.type == "tool-result")
				toolContent.result = result;
				//const lastMsg = this.room.history[this.room.history.length - 1];
				//(lastMsg.content[0] as ToolResultPart).result = result
			}

			if (response.type === RESPONSE_TYPE.ASK_TO) {

				const content = <ContentAskTo>response.content
				const result = await this.onSubAgent?.(content.agentId, content.question)
				// inserisco il risultato nel "tool-result"
				const toolContent = response.response.find(r => r.role == "tool")?.content?.find( c => c.type == "tool-result")
				toolContent.result = result;
				// const lastMsg = this.room.history[this.room.history.length - 1];
				// (lastMsg.content[0] as ToolResultPart).result = result
			}

			this.onLoop?.(this.room.id, agent.agent.id, response)

		} while (response.continue)

		return response
	}

}

export default RoomTurnBased