import ajax, { CallOptions } from "@/plugins/AjaxService"
import { AgentLlm } from "@/types/Agent"



/** INDEX */
function index(opt?: CallOptions): Promise<AgentLlm[]> {
	return ajax.get(`agents`, opt)
}

/** GET */
function get(id: string, opt?: CallOptions): Promise<AgentLlm> {
	return ajax.get(`agents/${id}`, opt)
}

/** CREATE NEW */
function create(agent: Partial<AgentLlm>, opt?: CallOptions): Promise<AgentLlm> {
	return ajax.post(`agents`, { agent }, opt)
}

/** UPDATE */
function update(agent: Partial<AgentLlm>, opt?: CallOptions): Promise<AgentLlm> {
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