import ajax, { CallOptions } from "@/plugins/AjaxService";
import { Account } from "../types/User";



/** INDEX */
function index(opt?: CallOptions): Promise<Account[]> {
	return ajax.get(`accounts`, opt)
}

/** GET */
async function get(id: string, opt?: CallOptions): Promise<Account> {
	if (!id) return
	const user = await ajax.get(`accounts/${id}`, opt)
	return user
}

/** DELETE */
function remove(id: string, opt?: CallOptions): Promise<void> {
	if (!id) return
	return ajax.delete(`accounts/${id}`, null, opt)
}

/** CREATE */
function create(user: Account, opt?: CallOptions): Promise<Account> {
	if (!user) return
	return ajax.post(`accounts`, user, opt)
}

/** UPDATE */
function update(user: Account, opt?: CallOptions): Promise<Account> {
	if (!user) return
	return ajax.post(`accounts/${user.id}`, user, opt)
}


const accountApi = {
	index,
	get,
	remove,
	create,
	update,
}
export default accountApi