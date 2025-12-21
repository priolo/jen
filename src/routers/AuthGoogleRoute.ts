import { Bus, httpRouter, jwt, typeorm } from "@priolo/julian";
import { Request, Response } from "express";
import { OAuth2Client } from 'google-auth-library';
import { FindManyOptions } from "typeorm";
import { AccountRepo, accountSendable, JWTPayload } from "../repository/Account.js";



export const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthGoogleRoute extends httpRouter.Service {

	get stateDefault() {
		return {
			...super.stateDefault,
			path: "/api/auth/google",
			email: "/email",
			repository: "/typeorm/accounts",
			jwt: "/jwt",
			routers: [
				{ path: "/login", verb: "post", method: "login" },
			]
		}
	}
	declare state: typeof this.stateDefault



	/** login/register con GOOGLE */
	async login(req: Request, res: Response) {
		const { token } = req.body
		if (!token) return res.status(400).json({ error: "Missing token parameter" });
		try {
			// Verifico GOOGLE token e ricavo PAYLOAD
			const ticket = await client.verifyIdToken({
				idToken: token,
				audience: process.env.GOOGLE_CLIENT_ID,
			});
			const payload = ticket.getPayload();
			if (!payload || !payload.email) return res.status(400).json({ error: "Invalid Google token payload" });


			// FIND ACCOUNT or VOID ACCOUNT
			let user: AccountRepo = await new Bus(this, this.state.repository).dispatch({
				type: typeorm.Actions.FIND_ONE,
				payload: <FindManyOptions<AccountRepo>>{
					where: [
						{ email: payload.email },
						{ googleEmail: payload.email },
					],
				}
			}) ?? {}

			// ACCOUNT UPDATE or CREATE
			user = await new Bus(this, this.state.repository).dispatch({
				type: typeorm.Actions.SAVE,
				payload: {
					...user,
					email: payload.email,
					googleEmail: payload.email,
					name: user.name ?? payload.name,
					avatarUrl: payload.picture ?? user.avatarUrl,
				},
			})


			// Genera il token JWT con l'email nel payload
			const jwtToken: string = await new Bus(this, "/jwt").dispatch({
				type: jwt.Actions.ENCODE,
				payload: {
					payload: <JWTPayload>{
						id: user.id,
						name: payload.name,
						email: payload.email,
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
				user: accountSendable(user),
			});

		} catch (error) {
			res.status(401).json({ error: 'Invalid Token' });
		}
	}

}

export default AuthGoogleRoute