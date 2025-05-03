import ajax, { CallOptions } from "@/plugins/AjaxService"
import { BaseOperation } from "slate"
import { Doc, FilterDoc } from "../types/Doc"



/** INDEX */
function index(filter?: FilterDoc, opt?: CallOptions): Promise<{ data: any }> {
	return ajax.get(`docs`, opt)
}


/** GET */
function get(id: string, opt?: CallOptions): Promise<{ data: Doc }> {
	return ajax.get(`docs/${id}`, opt)
}

/** CREATE NEW */
function create(doc: Partial<Doc>, opt?: CallOptions): Promise<{ data: string}> {
	return ajax.post(`docs`, { doc }, opt)
}


/** UPDATE */
function update(id: string, actions: BaseOperation[], opt?: CallOptions): Promise<{ data: string }> {
	return ajax.patch(
		`docs/${id}`,
		{ actions },
		opt
	)
}


const docApi = {
	index,
	get,
	create,
	update,
}
export default docApi