import { ChatRoom } from "@/types/commons/RoomActions"


export interface Chat {
	id: string
	clientsIds: string[]
	rooms: ChatRoom[]
}


export function getRoomById( chat: Chat, roomId: string ): ChatRoom {
	return chat.rooms?.find(r => r.id == roomId) ?? null
}

