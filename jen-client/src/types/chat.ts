import { AccountDTO } from "@/types/account"
import { ChatRoom } from "@/types/commons/RoomActions"


export interface Chat {
	id: string
	clients: AccountDTO[]
	rooms: ChatRoom[]
}
