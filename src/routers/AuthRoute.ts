import crypto from "crypto"
import { Request, Response } from "express"
import { OAuth2Client } from 'google-auth-library'
import { Bus, PathFinder, RepoRestActions, email as emailNs, httpRouter, jwt, typeorm } from "typexpress"
import { ENV_TYPE } from "../utils.js";


const client = new OAuth2Client('YOUR_GOOGLE_CLIENT_ID');



class AuthRoute extends httpRouter.Service {

	get stateDefault() {
		return {
			...super.stateDefault,
			path: "/auth",
			email: "/email",
			repository: "/typeorm/users",
			jwt: "/jwt",
			routers: [
				{ path: "/google", verb: "post", method: "googleLogin" },
				{ path: "/current", verb: "get", method: "current" },
				{ path: "/logout", verb: "post", method: "logout" },

				{ path: "/register", verb: "post", method: "registerUser" },
				{ path: "/activate", verb: "post", method: "activate" },
				{ path: "/login", verb: "post", method: "login" },
			]
		}
	}

	/** se esiste JWT restituisce l'utente */
	async current(req: Request, res: Response) {

		// ricavo JWT dai cookies
		const token = req.cookies.jwt;
		if (!token) {
			return res.status(401).json({ user: null });
		}

		// Verifica il token (puoi usare una libreria come jsonwebtoken per verificarlo)
		client.verifyIdToken({
			idToken: token,
			audience: '106027300810-0udm0cjghhjr87626qrvcoug5ahgq1bh.apps.googleusercontent.com',
		})
			// verificato. mando il payload di JWT
			.then(ticket => {
				const payload = ticket.getPayload();
				res.status(200).json({ user: payload });
			})
			// NON verificato
			.catch(() => res.status(401).json({ user: null }));
	}

	/** elimino il cookie JWT cosi da chiudere la sessione */
	async logout(req: Request, res: Response) {
		res.clearCookie('jwt');
		res.status(200).send('Logout successful');
	}


	async googleLogin(req: Request, res: Response) {
		const { token } = req.body;
		try {
			const ticket = await client.verifyIdToken({
				idToken: token,
				audience: '106027300810-0udm0cjghhjr87626qrvcoug5ahgq1bh.apps.googleusercontent.com',
			});
			const payload = ticket.getPayload();

			// Genera il token JWT con l'email nel payload
			const jwtToken = await new Bus(this, "/jwt").dispatch({
				type: jwt.Actions.ENCODE,
				payload: {
					payload: {
						email: payload.email,
					}
				},
			})

			// cerco lo USER tramite email
			const users: any[] = await new Bus(this, "/typeorm/users").dispatch({
				type: typeorm.Actions.FIND,
				payload: {
					where: { email: payload.email },
					//relations: ['providers']
				}
			})
			let user = users?.[0]

			// se non c'e' allora creo un nuovo USER
			if (!user) {
				user = await new Bus(this, "/typeorm/users").dispatch({
					type: RepoRestActions.SAVE,
					payload: {
						email: payload.email,
						name: payload.name,
						// providers: [
						// 	{ type: "google", token }
						// ]
					}
				})
			}

			// salvo JWT nel PROVIDER dello USER
			// [II] capire se è necessario
			// let provider = user.providers?.find(p => p.type == "google")
			// if (!provider) {
			// 	provider = await new Bus(this, "/typeorm/providers").dispatch({
			// 		type: RepoRestActions.SAVE,
			// 		payload: {
			// 			type: "google",
			// 			token,
			// 			user: { id: user.id },
			// 		}
			// 	})
			// }

			// memorizzo JWT nei cookies. Imposta il cookie HTTP-only
			res.cookie('jwt', jwtToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production', // Assicurati di usare secure solo in produzione
				maxAge: 24 * 60 * 60 * 1000, // 1 giorno
			});

			// restituisco i dati dell'utente loggato
			res.status(200).json({ user: payload });

		} catch (error) {
			res.status(401).json({ error: 'Invalid Token' });
		}
	}



	/**
	 * Grazie all'"email" registra un nuovo utente
	 */
	async registerUser(req: Request, res: Response) {
		const { email: emailPath, repository } = this.state
		const { email } = req.body
		const emailService = new PathFinder(this).getNode<emailNs.Service>(emailPath)
		const userService = new PathFinder(this).getNode<typeorm.repo>(repository)

		// creo il codice segreto da inviare per email
		const code = process.env.NODE_ENV == ENV_TYPE.TEST ? "AAA" : crypto.randomBytes(8).toString('hex')

		// creo un utente temporaneo con il codice da attivare
		await userService.dispatch({
			type: RepoRestActions.SAVE,
			payload: {
				email,
				salt: code,
			}
		})

		// invio l'email per l'attivazione del codice
		await emailService.dispatch({
			type: emailNs.Actions.SEND,
			payload: {
				from: "from@test.com",
				to: "to@test.com",
				subject: "Richiesta registraziuone",
				html: `
					<div>ue ueue ti vuoi reggggistrare! he?</div> 
					<div>questo è il codice</div> 
					<div>${code}</div> 
					<a href="http://localhost:8080/api/activate?code=${code}">registrami ti prego!</a>
				`,
			}
		})

		res.status(200).json({ data: "activate:ok" })
	}

	/**
	 * Permette di attivare un utente confermado con il "code" e la "password"
	 */
	async activate(req: Request, res: Response) {
		const { repository } = this.state
		var { code, password } = req.body
		const userService = new PathFinder(this).getNode<typeorm.repo>(repository)

		const users = await userService.dispatch({
			type: typeorm.Actions.FIND,
			payload: { where: { salt: code } }
		})

		if (users.length == 0) return res.status(404).json({ error: "activate:code:not_found" })
		const user = users[0]

		// Creating a unique salt for a particular user 
		user.salt = crypto.randomBytes(16).toString('hex');
		// Hashing user's salt and password with 1000 iterations, 
		user.password = crypto.pbkdf2Sync(password, user.salt, 1000, 64, `sha512`).toString(`hex`);

		await userService.dispatch({
			type: RepoRestActions.SAVE,
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
		const userService = new PathFinder(this).getNode<typeorm.repo>(repository)

		// get user
		const users = await userService.dispatch({
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
		const jwtService = new PathFinder(this).getNode<httpRouter.jwt.Service>("/http/route/route-jwt")
		const token = await jwtService.putPayload(user, res)
		res.json({ token })
	}
}

export default AuthRoute