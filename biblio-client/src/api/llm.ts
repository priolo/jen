import ajax, { CallOptions } from "@/plugins/AjaxService"
import { Llm } from "@/types/Llm"



/** INDEX */
function index(opt?: CallOptions): Promise<Llm[]> {
	return ajax.get(`llm`, opt)
}


/** GET */
function get(id: string, opt?: CallOptions): Promise<Llm> {
	return ajax.get(`llm/${id}`, opt)
}

/** CREATE NEW */
function create(llm: Partial<Llm>, opt?: CallOptions): Promise<Llm> {
	return ajax.post(`llm`, { doc: llm }, opt)
}


/** UPDATE */
function update(llm: Llm, opt?: CallOptions): Promise<Llm> {
	return ajax.patch(
		`llm/${llm.id}`,
		{ llm },
		opt
	)
}


const llmApi = {
	index,
	get,
	create,
	update,
}
export default llmApi