import ajax, { CallOptions } from "@/plugins/AjaxService"
import { LlmDTO } from "@shared/types/LlmDTO"



/** INDEX */
function index(opt?: CallOptions): Promise<{ llms: LlmDTO[] }> {
	return ajax.get(`llms`, opt)
}

/** GET */
function get(id: string, opt?: CallOptions): Promise<{ llm: LlmDTO }> {
	return ajax.get(`llms/${id}`, opt)
}

/** CREATE NEW */
function create(llm: Partial<LlmDTO>, opt?: CallOptions): Promise<{ llm: LlmDTO }> {
	return ajax.post(`llms`, { llm }, opt)
}

/** UPDATE */
function update(llm: Partial<LlmDTO>, opt?: CallOptions): Promise<{ llm: LlmDTO }> {
	return ajax.patch(`llms/${llm.id}`, { llm }, opt)
}

/** DELETE */
function remove(llmId: string, opt?: CallOptions): Promise<void> {
	return ajax.delete(`llms/${llmId}`, null, opt)
}


const llmApi = {
	index,
	get,
	create,
	update,
	remove,
}
export default llmApi