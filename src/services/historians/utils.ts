import { ChatMessage } from "@/types/commons/RoomActions.js"


export function overridingToolResponse(history: ChatMessage[], overriding:(msg:ChatMessage) => ChatMessage): ChatMessage[] {
	return history.map(msg => {
		if (msg.role != 'agent' || msg.clientId != agentId) return msg
		return {
			...msg,
			content: `**[Agent ${agentId}]:**\n\n${typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}`
		}
	})
} 