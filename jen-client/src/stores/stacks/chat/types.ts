import { ChatRoom } from "@/types/commons/RoomActions"


export interface Chat {
	id: string
	clientsIds: string[]
	rooms: ChatRoom[]
}
