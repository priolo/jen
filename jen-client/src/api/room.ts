import ajax, { CallOptions } from "@/plugins/AjaxService"
import { RoomDTO } from "@shared/types/RoomDTO"



/** INDEX */
function index(opt?: CallOptions): Promise<RoomDTO[]> {
	return ajax.get(`rooms`, opt)
}

/** GET */
function get(id: string, opt?: CallOptions): Promise<RoomDTO> {
	return ajax.get(`rooms/${id}`, opt)
}

/** CREATE NEW */
function create(prompt: Partial<RoomDTO>, opt?: CallOptions): Promise<RoomDTO> {
	return ajax.post(`rooms`, { prompt }, opt)
}

/** UPDATE */
function update(prompt: Partial<RoomDTO>, opt?: CallOptions): Promise<RoomDTO> {
	return ajax.patch(`rooms/${prompt.id}`, { prompt }, opt)
}

/** DELETE */
function remove(promptId: string, opt?: CallOptions): Promise<void> {
	return ajax.delete(`rooms/${promptId}`, null, opt)
}

/** EXECUTE */
function execute(prompt: Partial<RoomDTO>, opt?: CallOptions): Promise<Partial<RoomDTO>> {
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