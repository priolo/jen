import ajax, { CallOptions } from "@/plugins/AjaxService"
import { AccountDTO } from "@/types/account"




/**
 * Chiede di mandare il CODE ad un email 
 */
function emailSendCode(email: string, opt?: CallOptions): Promise<{ data: any }> {
	return ajax.post(`auth/email_code`, { email }, opt)
}
/**
 * Verifico un CODE se esiste e restituisco l'ACCOUNT collegato
 */
function emailVerify(code: string, opt?: CallOptions): Promise<{ user: AccountDTO }> {
	return ajax.post(`auth/email_verify`, { code }, opt)
}





const authEmailApi = {
	emailSendCode,
	emailVerify,
}

export default authEmailApi