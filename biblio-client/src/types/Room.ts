import { Agent } from "./Agent";
import { Uuid } from "./global";
import { ChatMessage } from "./RoomActions";



export interface Room {
	id: Uuid
	history: ChatMessage[]
	agentId?: Uuid
	agent?: Agent
	parentRoomId?: string | null;
}
