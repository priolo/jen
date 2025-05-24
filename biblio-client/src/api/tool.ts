import ajax, { CallOptions } from "@/plugins/AjaxService"
import { Tool } from "@/types/Tool"



/** INDEX */
function index(opt?: CallOptions): Promise<Tool[]> {
	return ajax.get(`tools`, opt)
}

/** GET */
function get(id: string, opt?: CallOptions): Promise<Tool> {
	return ajax.get(`tools/${id}`, opt)
}

/** CREATE NEW */
function create(tool: Partial<Tool>, opt?: CallOptions): Promise<Tool> {
	return ajax.post(`tools`, { tool }, opt)
}

/** UPDATE */
function update(tool: Partial<Tool>, opt?: CallOptions): Promise<Tool> {
	return ajax.patch(`tools/${tool.id}`, { tool }, opt)
}

/** DELETE */
function remove(toolId: string, opt?: CallOptions): Promise<void> {
	return ajax.delete(`tools/${toolId}`, null, opt)
}


const toolApi = {
	index,
	get,
	create,
	update,
	remove,
}
export default toolApi