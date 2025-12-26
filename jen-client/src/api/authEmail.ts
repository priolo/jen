import ajax, { CallOptions } from "@/plugins/AjaxService"
import { Account } from "@/types/Account"




/**
 * Chiede di mandare il CODE ad un email 
 */
function emailSendCode(email: string, opt?: CallOptions): Promise<{ data: any }> {
	return ajax.post(`auth/email_code`, { email }, opt)
}
/**
 * Verifico un CODE se esiste e restituisco l'ACCOUNT collegato
 */
function emailVerify(code: string, opt?: CallOptions): Promise<{ user: Account }> {
	return ajax.post(`auth/email_verify`, { code }, opt)
}





const authEmailApi = {
	emailSendCode,
	emailVerify,
}

export default authEmailApi