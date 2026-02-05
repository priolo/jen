import { AccountDTO } from "./AccountDTO.js"
import { RoomDTO } from "./RoomDTO.js"


/**
 * uno spazio di ROOM dove ci sono più utenti che possono comunicare in piu' ROOM
 */
export interface ChatDTO {
	id: string
	/** Proprietario della CHAT */
	accountId?: string
	name?: string
	description?: string
	/** L'id della ROOM principale della CHAT. Da questa partono tutte le altre */
	mainRoomId?: string
	/** le ROOMs aperte in questa CHAT */
	rooms: RoomDTO[]
	/** utenti registrati a questa CHAT (potrebbero essere OFFLINE) */
	users?: AccountDTO[]
	/** gli users attualmente ONLINE */
	clients?: AccountDTO[]
}

