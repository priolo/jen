import { CoreMessage } from "ai";
import { Agent } from "./Agent";
import { Uuid } from "./global";



export class Room {
	id: Uuid
	name: string
	history: CoreMessage[]
	agentId?: Uuid
	agent?: Agent
}
