import { Bus, httpRouter, jwt, typeorm } from "@priolo/julian";
import { Request, Response } from "express";
import { FindOneOptions } from "typeorm";
import { AccountRepo } from "../repository/Account.js";
import { AccountDTO, JWTPayload } from '@/types/account.js';
import { ENV_TYPE } from "../types/env.js";
import { REPO_PATHS } from "@/config.js";



class AuthRoute extends httpRouter.Service {

	get stateDefault() {
		return {
			...super.stateDefault,
			path: "/api/auth",
			jwt: "/jwt",
			routers: [
				{ path: "/current", verb: "get", method: "current" },
				{ path: "/logout", verb: "post", method: "logout" },
				{ path: "/autologin", verb: "post", method: "autoLogin" },
			]
		}
	}
	declare state: typeof this.stateDefault

	/** se esiste JWT restituisce l'utente */
	async current(req: Request, res: Response) {

		// [II] da togliere
		if (process.env.NODE_ENV == ENV_TYPE.DEV && process.env.AUTO_AUTH_ENABLE === "true") {
			this.autoLogin(req, res)
			return 
		}

		// ricavo JWT dai cookies
		const token: string = req.cookies.jwt;
		if (!token) return res.status(401).json({ user: null });

		try {

			// decodifico il JWT per andare a cercarlo nel DB
			const userJwt: JWTPayload = await new Bus(this, "/jwt").dispatch({
				type: jwt.Actions.DECODE,
				payload: token,
			})

			// carico l'ACCOUNT dal DB
			const user: AccountRepo = await new Bus(this, REPO_PATHS.ACCOUNTS).dispatch({
				type: typeorm.Actions.GET_BY_ID,
				payload: userJwt.id
			})

			// se non c'e' allora errore
			if (!user) return res.status(404).json({ user: null })

			// restituisco i dati dell'utente loggato
			res.status(200).json({
				user: AccountDTO(user),
			});

		} catch (error) {
			// NON verificato
			res.status(401).json({ user: null })
		}
	}

	/** elimino il cookie JWT cosi da chiudere la sessione */
	async logout(req: Request, res: Response) {
		res.clearCookie('jwt');
		res.status(200).send('Logout successful');
	}

	/** eseguo autologin per DEV e TEST */
	async autoLogin(req: Request, res: Response) {
		let userId: string | undefined = req.query?.userid as string
		if (!userId) userId = "id-user-1"

		// carico l'account DEMO
		const user: AccountRepo = await new Bus(this, REPO_PATHS.ACCOUNTS).dispatch({
			type: typeorm.Actions.FIND_ONE,
			payload: <FindOneOptions<AccountRepo>>{
				where: { id: userId },
			}
		})

		// Genera il token JWT con l'email nel payload
		const jwtToken: string = await new Bus(this, "/jwt").dispatch({
			type: jwt.Actions.ENCODE,
			payload: {
				payload: <JWTPayload>{
					id: user.id,
					email: user.email,
					name: user.name,
				}
			},
		})
		// memorizzo JWT nei cookies. Imposta il cookie HTTP-only
		res.cookie('jwt', jwtToken, {
			httpOnly: true,
			secure: true,
			maxAge: 24 * 60 * 60 * 1000, // 1 giorno
		});
		// restituisco i dati dell'utente loggato
		res.status(200).json({
			user: AccountDTO(user),
		});
	}

}

export default AuthRoute