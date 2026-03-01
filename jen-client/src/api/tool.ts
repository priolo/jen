import ajax, { CallOptions } from "@/plugins/AjaxService"
import { ToolDTO } from "@shared/types/ToolDTO"



/** INDEX */
function index(opt?: CallOptions): Promise<{tools: ToolDTO[]}> {
	return ajax.get(`tools`, opt)
}

/** GET */
function get(id: string, opt?: CallOptions): Promise<{tool: ToolDTO}> {
	return ajax.get(`tools/${id}`, opt)
}

/** CREATE NEW */
function create(tool: Partial<ToolDTO>, opt?: CallOptions): Promise<{tool: ToolDTO}> {
	return ajax.post(`tools`, { tool }, opt)
}

/** UPDATE */
function update(tool: Partial<ToolDTO>, opt?: CallOptions): Promise<{tool: ToolDTO}> {
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