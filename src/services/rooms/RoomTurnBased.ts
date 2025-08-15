import { RoomRepo } from "@/repository/Room.js";
import { ChatMessage } from "@/types/RoomActions.js";
import AgentLlm from "../agents/AgentLlm.js";
import { ContentAskTo, ContentTool, Response, RESPONSE_TYPE } from '../agents/types.js';
import { ToolResultPart } from "ai";



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
			let result:any;

			if (response.type === RESPONSE_TYPE.TOOL) {
				const content = <ContentTool>response.content
				result = await this.onTool?.(content.id, content.args);
				const lastMsg = this.room.history[this.room.history.length - 1];
				(lastMsg.content[0] as ToolResultPart).result = result
			}

			if (response.type === RESPONSE_TYPE.ASK_TO) {

				const content = <ContentAskTo>response.content
				result = await this.onSubAgent?.(content.agentId, content.question)
				const lastMsg = this.room.history[this.room.history.length - 1];
				(lastMsg.content[0] as ToolResultPart).result = result


				// const agentSub = new AgentLlm(agentsRepo.find(a => a.id === (<ContentAskTo>resp.content).agentId))
				// const historySub: ChatMessage[] = [
				// 	{ role: "user", content: (<ContentAskTo>resp.content).question },
				// ]
				// let respSub:Response;
				// do {
				// 	respSub = await agentSub.ask(historySub)
				// 	historySub.push(...respSub.response)

				// } while (respSub.continue);
				// // ---

				// const lastMsg = history[history.length - 1];
				// (<ToolResultPart>lastMsg.content[0]).result = (<ContentCompleted>respSub.content).answer;

			}

			this.onLoop?.(this.room.id, agent.agent.id, result)

		} while (response.continue)

		return response
	}

}

export default RoomTurnBased