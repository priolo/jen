import { CoreMessage } from "ai";
import { Agent } from "./Agent";
import { Uuid } from "./global";



export interface Room {
	id: Uuid
	name: string
	history: CoreMessage[]
	agentId?: Uuid
	agent?: Agent
	parentRoomId?: string | null;
    messageId?: string | null;
}
