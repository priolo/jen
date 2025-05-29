import ajax, { CallOptions } from "@/plugins/AjaxService"
import { Prompt } from "@/types/Prompt"



/** INDEX */
function index(opt?: CallOptions): Promise<Prompt[]> {
	return ajax.get(`prompts`, opt)
}

/** GET */
function get(id: string, opt?: CallOptions): Promise<Prompt> {
	return ajax.get(`prompts/${id}`, opt)
}

/** CREATE NEW */
function create(prompt: Partial<Prompt>, opt?: CallOptions): Promise<Prompt> {
	return ajax.post(`prompts`, { prompt }, opt)
}

/** UPDATE */
function update(prompt: Partial<Prompt>, opt?: CallOptions): Promise<Prompt> {
	return ajax.patch(`prompts/${prompt.id}`, { prompt }, opt)
}

/** DELETE */
function remove(promptId: string, opt?: CallOptions): Promise<void> {
	return ajax.delete(`prompts/${promptId}`, null, opt)
}


const promptApi = {
	index,
	get,
	create,
	update,
	remove,
}
export default promptApi