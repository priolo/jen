import ajax, { CallOptions } from "@/plugins/AjaxService"
import { ChatDTO } from "@shared/types/ChatDTO"



/** INDEX */
async function index(opt?: CallOptions): Promise<ChatDTO[]> {
	let chats:ChatDTO[] = await ajax.get(`chats`, opt)
	//chats.forEach( chat => chat.onlineUserIds = [] )
	return chats
}

/** GET */
async function get(id: string, opt?: CallOptions): Promise<ChatDTO> {
	const chat:ChatDTO = await ajax.get(`chats/${id}`, opt)
	//chat.onlineUserIds = []
	return chat
}

/** CREATE NEW */
function create(chat: Partial<ChatDTO>, opt?: CallOptions): Promise<ChatDTO> {
	return ajax.post(`chats`, { chat }, opt)
}

/** UPDATE */
function update(chat: Partial<ChatDTO>, opt?: CallOptions): Promise<ChatDTO> {
	return ajax.patch(`chats/${chat.id}`, { chat }, opt)
}

/** DELETE */
function remove(id: string, opt?: CallOptions): Promise<void> {
	return ajax.delete(`chats/${id}`, null, opt)
}


// TODO da cambiare nome

/** Invita un USER */
function inviteUser(id: string, userId: string, opt?: CallOptions): Promise<void> {
	return ajax.post(`chats/${id}/invite`, { userId }, opt)
}
/** Rimuove un USER */
function removeUser(id: string, userId: string, opt?: CallOptions): Promise<void> {
	return ajax.post(`chats/${id}/remove`, { userId }, opt)
}



const chatApi = {
	index,
	get,
	create,
	update,
	remove,

	inviteUser,
	removeUser,
}
export default chatApi