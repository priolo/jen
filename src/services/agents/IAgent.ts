import { ChatMessage } from "@shared/types/commons/RoomActions.js";
import { LlmResponse } from "@shared/types/commons/LlmResponse.js";
import { AgentRepo } from "@/repository/Agent.js";

/**
 * Interfaccia per un AGENT che può essere utilizzato in una ROOM
 */
export interface IAgent {
    agent: AgentRepo
    ask(history: ChatMessage[]): Promise<LlmResponse>
    overrideSystemPrompt: (systemPrompt: string) => string
}