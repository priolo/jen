import ajax, { CallOptions } from "@/plugins/AjaxService"
import { User } from "@/types/User"



function current(opt?: CallOptions): Promise<User> {
	return ajax.get(`auth/current`, { ...opt, isLogin: true })
}

const authApi = {
	current,
}
export default authApi