import ajax, { CallOptions } from "@/plugins/AjaxService";
import { Account } from "../types/Account";



/** INDEX */
function index(filter?: { text?: string }, opt?: CallOptions): Promise<{ accounts: Account[] }> {
	const params = new URLSearchParams();
	if (filter?.text) {
		params.append('text', filter.text);
	}
	const queryString = params.toString();
	const url = queryString ? `accounts?${queryString}` : 'accounts';
	return ajax.get(url, opt)
}

/** GET */
async function get(id: string, opt?: CallOptions): Promise<{ account: Account }> {
	if (!id) throw new Error("Account ID is required");
	return await ajax.get(`accounts/${id}`, opt)
}

/** DELETE */
function remove(id: string, opt?: CallOptions): Promise<void> {
	if (!id) throw new Error("Account ID is required");
	return ajax.delete(`accounts/${id}`, null, opt)
}

/** CREATE */
function create(user: Account, opt?: CallOptions): Promise<{ account: Account }> {
	if (!user) throw new Error("Account data is required");
	return ajax.post(`accounts`, user, opt)
}

/** UPDATE */
function update(user: Account, opt?: CallOptions): Promise<{account: Account}> {
	if (!user) throw new Error("Account data is required");
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