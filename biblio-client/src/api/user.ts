import ajax, { CallOptions } from "@/plugins/AjaxService";
import { User } from "../types/User";



/** INDEX */
function index(opt?: CallOptions): Promise<User[]> {
	return ajax.get(`users`, opt)
}

/** GET */
async function get(id: string, opt?: CallOptions): Promise<User> {
	if (!id) return
	const user = await ajax.get(`users/${id}`, opt)
	return user
}

/** DELETE */
function remove(id: string, opt?: CallOptions): Promise<void> {
	if (!id) return
	return ajax.delete(`users/${id}`, null, opt)
}

/** CREATE */
function create(user: User, opt?: CallOptions): Promise<User> {
	if (!user) return
	return ajax.post(`users`, user, opt)
}

/** UPDATE */
function update(user: User, opt?: CallOptions): Promise<User> {
	if (!user) return
	return ajax.post(`users/${user.id}`, user, opt)
}



function _error(connectionId: string, opt?: CallOptions): Promise<User[]> {
	return ajax.get(`connection/${connectionId}/stream_error`, opt)
}


const userApi = {
	_error,
	index,
	get,
	remove,
	create,
	update,
}
export default userApi