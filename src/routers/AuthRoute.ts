import { PROVIDER_NAME, ProviderRepo } from "@/repository/Provider.js";
import { AccountRepo } from "@/repository/Account.js";
import { Bus, httpRouter, jwt, typeorm } from "@priolo/julian";
import crypto from "crypto";
import { Request, Response } from "express";
import { OAuth2Client } from 'google-auth-library';
import { FindManyOptions } from "typeorm";
import { ENV_TYPE } from "@/types/env.js";




const client = new OAuth2Client('YOUR_GOOGLE_CLIENT_ID');



class AuthRoute extends httpRouter.Service {

	get stateDefault() {
		return {
			...super.stateDefault,
			path: "/api/auth",
			email: "/email",
			repository: "/typeorm/accounts",
			jwt: "/jwt",
			routers: [
				{ path: "/google", verb: "post", method: "googleLogin" },
				{ path: "/current", verb: "get", method: "current" },
				{ path: "/logout", verb: "post", method: "logout" },

				//{ path: "/register", verb: "post", method: "registerUser" },
				//{ path: "/activate", verb: "post", method: "activate" },
				//{ path: "/login", verb: "post", method: "login" },
			]
		}
	}

	/** se esiste JWT restituisce l'utente */
	async current(req: Request, res: Response) {

		if (process.env.NODE_ENV == ENV_TYPE.DEV && process.env.AUTO_AUTH_ENABLE === "true") {
			return this.currentDemo(req, res);
		}

		// ricavo JWT dai cookies
		const token = req.cookies.jwt;
		if (!token) {
			return res.status(401).json({ user: null });
		}

		try {

			// decodifico il JWT per andare a cercarlo nel DB
			const data = await new Bus(this, "/jwt").dispatch({
				type: jwt.Actions.DECODE,
				payload: token,
			})

			// cerco lo USER tramite email
			const users: AccountRepo[] = await new Bus(this, this.state.repository).dispatch({
				type: typeorm.Actions.FIND,
				payload: <FindManyOptions<AccountRepo>>{
					//select: ["id", "email", "name", "avatar"],
					where: { email: data.email },
				}
			})
			const user = users?.[0]

			// se non c'e' allora errore
			if (!user) return res.status(404).json({ user: null })

			//#region GOOGLE

			// Verifica il token (puoi usare una libreria come jsonwebtoken per verificarlo)
			// const ticket = await client.verifyIdToken({
			// 	idToken: token,
			// 	audience: '106027300810-0udm0cjghhjr87626qrvcoug5ahgq1bh.apps.googleusercontent.com',
			// })
			// verificato. mando il payload di JWT
			//const user = ticket.getPayload();

			//#endregion

			// restituisco i dati dell'utente loggato
			delete user.password
			delete user.salt
			res.status(200).json({ user });

		} catch (error) {
			// NON verificato
			res.status(401).json({ user: null })
		}
	}
	private async currentDemo(req: Request, res: Response) {
		// carico l'account DEMO
		const user: AccountRepo = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.Actions.FIND_ONE,
			payload: <FindManyOptions<AccountRepo>>{
				//select: ["id", "email", "name", "avatar"],
				where: { id: "id-user-1" },
			}
		})
		// Genera il token JWT con l'email nel payload
		const jwtToken = await new Bus(this, "/jwt").dispatch({
			type: jwt.Actions.ENCODE,
			payload: {
				payload: {
					id: user.id,
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
		delete user.password
		delete user.salt
		res.status(200).json({ user });
	}



	/** elimino il cookie JWT cosi da chiudere la sessione */
	async logout(req: Request, res: Response) {
		res.clearCookie('jwt');
		res.status(200).send('Logout successful');
	}

	/** eseguo il login con GOOGLE */
	async googleLogin(req: Request, res: Response) {
		const { token } = req.body;
		try {

			// Verifico GOOGLE token e ricavo PAYLOAD
			const ticket = await client.verifyIdToken({
				idToken: token,
				audience: '106027300810-0udm0cjghhjr87626qrvcoug5ahgq1bh.apps.googleusercontent.com',
			});
			const payload = ticket.getPayload();

			// cerco lo USER tramite email
			const users: any[] = await new Bus(this, this.state.repository).dispatch({
				type: typeorm.Actions.FIND,
				payload: <FindManyOptions<AccountRepo>>{
					where: { email: payload.email },
				}
			})
			let user: AccountRepo = users?.[0]

			// se non c'e' allora creo un nuovo USER
			if (!user) {
				user = await new Bus(this, this.state.repository).dispatch({
					type: typeorm.RepoRestActions.SAVE,
					payload: <AccountRepo>{
						email: payload.email,
						name: payload.name,
						avatarUrl: payload.picture,
					}
				})
			}
			// cancello eventuali vecchi PROVIDER
			await new Bus(this, "/typeorm/providers").dispatch({
				type: typeorm.RepoRestActions.DELETE,
				payload: <ProviderRepo>{
					name: PROVIDER_NAME.GOOGLE,
					userId: user.id,
				}
			})
			// inserisco il PROVIDER per questo USER
			await new Bus(this, "/typeorm/providers").dispatch({
				type: typeorm.RepoRestActions.SAVE,
				payload: <ProviderRepo>{
					name: PROVIDER_NAME.GOOGLE,
					key: token,
					userId: user.id,
				}
			})

			// Genera il token JWT con l'email nel payload
			const jwtToken = await new Bus(this, "/jwt").dispatch({
				type: jwt.Actions.ENCODE,
				payload: {
					payload: {
						id: user.id,
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
			delete user.password
			delete user.salt
			res.status(200).json({ user });

		} catch (error) {
			res.status(401).json({ error: 'Invalid Token' });
		}
	}



	/**
	 * Grazie all'"email" registra un nuovo utente
	 */
	// async registerUser(req: Request, res: Response) {
	// 	const { email: emailPath, repository } = this.state
	// 	const { email } = req.body
	// 	const emailService = new PathFinder(this).getNode<emailNs.Service>(emailPath)
	// 	const userService = new PathFinder(this).getNode<typeorm.repo>(repository)

	// 	// creo il codice segreto da inviare per email
	// 	const code = process.env.NODE_ENV == ENV_TYPE.TEST ? "AAA" : crypto.randomBytes(8).toString('hex')

	// 	// creo un utente temporaneo con il codice da attivare
	// 	await userService.dispatch({
	// 		type: RepoRestActions.SAVE,
	// 		payload: {
	// 			email,
	// 			salt: code,
	// 		}
	// 	})

	// 	// invio l'email per l'attivazione del codice
	// 	await emailService.dispatch({
	// 		type: emailNs.Actions.SEND,
	// 		payload: {
	// 			from: "from@test.com",
	// 			to: "to@test.com",
	// 			subject: "Richiesta registraziuone",
	// 			html: `
	// 				<div>ue ueue ti vuoi reggggistrare! he?</div> 
	// 				<div>questo è il codice</div> 
	// 				<div>${code}</div> 
	// 				<a href="http://localhost:8080/api/activate?code=${code}">registrami ti prego!</a>
	// 			`,
	// 		}
	// 	})

	// 	res.status(200).json({ data: "activate:ok" })
	// }

	/**
	 * Permette di attivare un utente confermado con il "code" e la "password"
	 */
	async activate(req: Request, res: Response) {
		var { code, password } = req.body

		const users = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.Actions.FIND,
			payload: { where: { salt: code } }
		})

		if (users.length == 0) return res.status(404).json({ error: "activate:code:not_found" })
		const user = users[0]

		// Creating a unique salt for a particular user 
		user.salt = crypto.randomBytes(16).toString('hex');
		// Hashing user's salt and password with 1000 iterations, 
		user.password = crypto.pbkdf2Sync(password, user.salt, 1000, 64, `sha512`).toString(`hex`);

		await new Bus(this, this.state.repository).dispatch({
			type: typeorm.RepoRestActions.SAVE,
			payload: user,
		})

		res.status(200).json({ data: "activate:ok" })
	}

	/**
	 * eseguo il login grazie a "email" e "password"
	 */
	async login(req: Request, res: Response) {
		const { repository } = this.state
		var { email, password } = req.body

		// get user
		const users = await new Bus(this, repository).dispatch({
			type: typeorm.Actions.FIND,
			payload: { where: { email } }
		})
		if (users.length == 0) return res.sendStatus(404)
		const user = users[0]

		// check password
		const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, `sha512`).toString(`hex`)
		const correct = hash == user.password
		if (!correct) return res.status(404).json({ error: "login:account:not_found" })

		// inserisco user nel payload jwt
		const jwtService = this.nodeByPath<httpRouter.jwt.Service>("/http/route/route-jwt")
		const token = await jwtService.putPayload(user, res)
		res.json({ token })
	}
}

export default AuthRoute