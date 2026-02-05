import { EMAIL_CODE } from '@shared/types/AccountDTO.js';
import { AccountDTOFromAccountRepo, JWTPayload } from '@/repository/Account.js';
import { Bus, email as emailNs, http, httpRouter, jwt, typeorm } from "@priolo/julian";
import crypto from "crypto";
import { Request, Response } from "express";
import { FindManyOptions } from "typeorm";
import { AccountRepo } from "../repository/Account.js";
import { CodeTemplate, loadTemplate } from "../services/templates/index.js";
import { ENV_TYPE } from "../types/env.js";



class AuthEmailRoute extends httpRouter.Service {

	get stateDefault() {
		return {
			...super.stateDefault,
			path: "/api/auth",
			email_path: "/email-noreply",
			account_repo: "/typeorm/accounts",
			jwt: "/jwt",
			routers: [
				{ path: "/email_code", verb: "post", method: "emailSendCode" },
				{ path: "/email_verify", verb: "post", method: "emailVerify" },
			]
		}
	}
	declare state: typeof this.stateDefault

	limiter = new http.RateLimiter(3, 10_000); // 3 calls / 10 seconds

	/**
	 * Grazie all'"email" registra un nuovo utente
	 */
	async emailSendCode(req: Request, res: Response) {
		const { email } = req.body
		if (!isEmail(email)) return res.status(400).json({ error: "email:invalid" })

		// RATE LIMITER
		if (this.limiter.isLimited(email)) {
			return res.status(429).json({ error: "Too many requests. Please try again later." });
		}

		// creo il codice segreto da inviare per email
		const code = process.env.NODE_ENV == ENV_TYPE.TEST
			? "AAA"
			: crypto.randomBytes(3).toString('hex').slice(0, 5).toUpperCase();

		// FIND ACCOUNT
		let user = await new Bus(this, this.state.account_repo).dispatch({
			type: typeorm.Actions.FIND_ONE,
			payload: <FindManyOptions<AccountRepo>>{
				where: [
					{ email: email },
					{ googleEmail: email }
				]
			}
		}) ?? { email }

		// ACCOUNT UPDATE
		user = await new Bus(this, this.state.account_repo).dispatch({
			type: typeorm.Actions.SAVE,
			payload: {
				...user,
				emailCode: code,
			},
		})

		// INVIO EMAIL con il codice e altri placeholder
		const html = await loadTemplate<CodeTemplate>({ code }, "templates/email/code.html")
		await new Bus(this, this.state.email_path).dispatch({
			type: emailNs.Actions.SEND,
			payload: {
				from: process.env.EMAIL_USER,
				to: email,
				subject: "Verification Code",
				html,
			}
		});

		res.status(200).json({ data: "ok" })
	}

	/**
	 * Permette di attivare un utente confermado con il "code" e la "password"
	 */
	async emailVerify(req: Request, res: Response) {
		var { code } = req.body
		if (!code) return res.status(400).json({ error: "activate:code:missing" })

			
		// cerco lo USER tramite il codice
		const user: AccountRepo = await new Bus(this, this.state.account_repo).dispatch({
			type: typeorm.Actions.FIND_ONE,
			payload: <FindManyOptions<AccountRepo>>{
				where: { emailCode: (<string>code).toUpperCase() }
			}
		})
		if (!user) return res.status(404).json({ error: "activate:code:not_found" })
		if (!isEmail(user.email)) return res.status(400).json({ error: "user:email:invalid" })
		if (user.emailCode === EMAIL_CODE.VERIFIED) return res.status(400).json({ error: "activate:code:already_verified" })
		

		// aggiorno lo USER
		user.emailCode = EMAIL_CODE.VERIFIED
		// assegno un nome di default se non esiste
		if (!user.name) user.name = user.email.split("@")[0]
		await new Bus(this, this.state.account_repo).dispatch({
			type: typeorm.Actions.SAVE,
			payload: {
				id: user.id,
				emailCode: user.emailCode,
				name: user.name,
			},
		})


		// Genera il token JWT con l'email nel payload
		const jwtToken: string = await new Bus(this, "/jwt").dispatch({
			type: jwt.Actions.ENCODE,
			payload: {
				payload: <JWTPayload>{
					id: user.id,
					name: user.name ?? user.email,
					email: user.email,
				}
			},
		})
		// memorizzo JWT nei cookies. Imposta il cookie HTTP-only
		res.cookie('jwt', jwtToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production', // Assicurati di usare secure solo in produzione
			maxAge: 24 * 60 * 60 * 1000, // 1 giorno
		});


		// restituisco i dati dell'utente loggato
		res.status(200).json({
			user: AccountDTOFromAccountRepo(user),
		});
	}

}

export default AuthEmailRoute

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isEmail(email: string): boolean {
	if (!email || email.trim().length == 0) return false;
	return emailRegex.test(email);
}