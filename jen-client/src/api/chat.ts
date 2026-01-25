import ajax, { CallOptions } from "@/plugins/AjaxService"
import { Chat } from "@/types/Chat"



/** INDEX */
function index(opt?: CallOptions): Promise<Chat[]> {
	return ajax.get(`chats`, opt)
}

/** GET */
function get(id: string, opt?: CallOptions): Promise<Chat> {
	return ajax.get(`chats/${id}`, opt)
}

/** CREATE NEW */
function create(chat: Partial<Chat>, opt?: CallOptions): Promise<Chat> {
	return ajax.post(`chats`, { chat }, opt)
}

/** UPDATE */
function update(chat: Partial<Chat>, opt?: CallOptions): Promise<Chat> {
	return ajax.patch(`chats/${chat.id}`, { chat }, opt)
}

/** DELETE */
function remove(id: string, opt?: CallOptions): Promise<void> {
	return ajax.delete(`chats/${id}`, null, opt)
}



const chatApi = {
	index,
	get,
	create,
	update,
	remove,
}
export default chatApi