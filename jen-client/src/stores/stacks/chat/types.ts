import { Room } from "@/types/Room"


export interface Chat {
	id: string
	clientsIds: string[]
	rooms: Room[]
}