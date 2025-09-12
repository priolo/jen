import ajax, { CallOptions } from "@/plugins/AjaxService"
import { User } from "@/types/User"



function current(opt?: CallOptions): Promise<{ user: User }> {
	return ajax.get(`auth/current`, { ...opt, isLogin: true })
}

function loginGoogle(token: string, opt?: CallOptions): Promise<{ user: User }> {
	return ajax.post(`auth/google`, { token }, { ...opt, isLogin: true })
}

function logout(opt?: CallOptions): Promise<{ user: User }> {
	return ajax.post(`auth/logout`, null, opt)
}


const authApi = {
	current,
	loginGoogle,
	logout,
}

export default authApi