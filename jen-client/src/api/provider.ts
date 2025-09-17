import ajax, { CallOptions } from "@/plugins/AjaxService"
import { Llm } from "@/types/Llm"



/** INDEX */
function index(opt?: CallOptions): Promise<Llm[]> {
	return ajax.get(`providers`, opt)
}

/** GET */
function get(id: string, opt?: CallOptions): Promise<Llm> {
	return ajax.get(`providers/${id}`, opt)
}

/** CREATE NEW */
function create(llm: Partial<Llm>, opt?: CallOptions): Promise<Llm> {
	return ajax.post(`providers`, { llm }, opt)
}

/** UPDATE */
function update(llm: Partial<Llm>, opt?: CallOptions): Promise<Llm> {
	return ajax.patch(`providers/${llm.id}`, { llm }, opt)
}

/** DELETE */
function remove(llmId: string, opt?: CallOptions): Promise<void> {
	return ajax.delete(`providers/${llmId}`, null, opt)
}


const providerApi = {
	index,
	get,
	create,
	update,
	remove,
}
export default providerApi