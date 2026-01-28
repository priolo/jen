import { AccountDTO } from "@/types/account"
import { RoomDTO } from "@shared/types/RoomDTO"


export interface Chat {
	id: string
	accountId?: string
	name?: string
	description?: string
	mainRoomId?: string
	rooms: RoomDTO[]
	users?: AccountDTO[]
	clients?: AccountDTO[]
}
