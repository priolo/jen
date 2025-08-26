import { Agent } from "./Agent";
import { Uuid } from "./global";
import { ChatMessage } from "./commons/RoomActions.js";



export interface Room {
	id: Uuid
	history: ChatMessage[]
	agentId?: Uuid
	agents?: Agent[]
	parentRoomId?: string 
}
