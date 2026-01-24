import { AccountDTO } from "@/types/account"
import { ChatRoom } from "@/types/commons/RoomActions"


export interface Chat {
	id: string
	name?: string
	description?: string
	clients?: AccountDTO[]
	mainRoomId?: string
	rooms: ChatRoom[]
}
