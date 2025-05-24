import ajax, { CallOptions } from "@/plugins/AjaxService"
import { Agent } from "@/types/Agent"



/** INDEX */
function index(opt?: CallOptions): Promise<Agent[]> {
	return ajax.get(`agents`, opt)
}

/** GET */
function get(id: string, opt?: CallOptions): Promise<Agent> {
	return ajax.get(`agents/${id}`, opt)
}

/** CREATE NEW */
function create(agent: Partial<Agent>, opt?: CallOptions): Promise<Agent> {
	return ajax.post(`agents`, { agent }, opt)
}

/** UPDATE */
function update(agent: Partial<Agent>, opt?: CallOptions): Promise<Agent> {
	return ajax.patch(`agents/${agent.id}`, { agent }, opt)
}

/** DELETE */
function remove(agentId: string, opt?: CallOptions): Promise<void> {
	return ajax.delete(`agents/${agentId}`, null, opt)
}


const agentApi = {
	index,
	get,
	create,
	update,
	remove,
}
export default agentApi