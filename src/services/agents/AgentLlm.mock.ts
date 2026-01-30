import { AgentRepo } from '@/repository/Agent.js';
import { ChatMessage } from "@shared/types/RoomActions.js";
import { time } from '@priolo/jon-utils';
import { LlmResponse } from "@shared/types/LlmResponse.js";



/**
 */
class AgentMock {

	constructor(
		public agent: Partial<AgentRepo>,
	) {
	}

	public async ask(history: ChatMessage[]): Promise<LlmResponse> {
		if (!history) return null

		const name = this.agent.name?.toLowerCase()
		let { default: responses } = await import(`./mock/${name}.js`);
		if (  !responses ) return null

		const count = history.filter( m => m.role=="agent").length
		// delay ragionamento
		await time.delay(200) 
		return responses[count]
	}
}

export default AgentMock
