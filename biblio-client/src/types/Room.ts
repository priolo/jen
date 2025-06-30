import { Agent } from "./Agent";
import { Uuid } from "./global";



export class Room {
	id: Uuid
	name: string
	history: HistoryItem[]
	agentId?: Uuid
	agent?: Agent
}

export interface HistoryItem {
    role: "user" | "llm";
    text: string;
}
