import { LLM_RESPONSE_TYPE, LlmResponse } from "@/types/commons/LlmResponse.js"
import { ChatMessage } from "@/types/commons/RoomActions.js"


/**
 * Add the agent name in to result
 */
export function transformAddAgentName(history: ChatMessage[], agents: { [id: string]: string }): ChatMessage[] {
	for (const msg of history) {
		if (msg.role != 'agent') continue
		const name = agents[msg.clientId]
		if (!name) continue
		const content = msg.content as LlmResponse
		content.content.result = `[${name}]: ${content.content.result}`
	}
	return history
} 

/**
 * Remove messages used for reasoning
 */
export function transformRemoveReasoning(history: ChatMessage[]): ChatMessage[] {
	return history.filter(msg => {
		if (msg.role != 'agent') return true
		const content = msg.content as LlmResponse
		if (content.type == LLM_RESPONSE_TYPE.REASONING || content.type == LLM_RESPONSE_TYPE.STRATEGY) return false
		return true
	})
}

/**
 * Give a AGENT transform all other AGENT messages in USEER messages
 * */
export function transformForAgent(history: ChatMessage[], agentId: string): ChatMessage[] {
	return history.map(msg => {
		if (msg.role != 'agent') return msg
		if (msg.clientId == agentId) return msg
		return {
			...msg,
			role: 'user',
			clientId: msg.clientId,
			content: (msg.content as LlmResponse).content.result
		}
	})
} 