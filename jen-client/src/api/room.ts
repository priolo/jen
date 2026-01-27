import ajax, { CallOptions } from "@/plugins/AjaxService"
import { ChatRoom } from "@shared/types/commons/RoomActions"



/** INDEX */
function index(opt?: CallOptions): Promise<ChatRoom[]> {
	return ajax.get(`rooms`, opt)
}

/** GET */
function get(id: string, opt?: CallOptions): Promise<ChatRoom> {
	return ajax.get(`rooms/${id}`, opt)
}

/** CREATE NEW */
function create(prompt: Partial<ChatRoom>, opt?: CallOptions): Promise<ChatRoom> {
	return ajax.post(`rooms`, { prompt }, opt)
}

/** UPDATE */
function update(prompt: Partial<ChatRoom>, opt?: CallOptions): Promise<ChatRoom> {
	return ajax.patch(`rooms/${prompt.id}`, { prompt }, opt)
}

/** DELETE */
function remove(promptId: string, opt?: CallOptions): Promise<void> {
	return ajax.delete(`rooms/${promptId}`, null, opt)
}

/** EXECUTE */
function execute(prompt: Partial<ChatRoom>, opt?: CallOptions): Promise<Partial<ChatRoom>> {
	return ajax.post(`rooms/execute`, { prompt }, opt)
}


const roomApi = {
	index,
	get,
	create,
	update,
	remove,
	execute,
}
export default roomApi