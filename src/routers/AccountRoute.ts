import { REPO_PATHS } from "@/config.js";
import { ACCOUNT_STATUS, AccountDTO, AccountDTOList, JWTPayload } from '@/types/account.js';
import { Bus, httpRouter, typeorm } from "@priolo/julian";
import { Request, Response } from "express";
import { FindManyOptions, Like } from "typeorm";
import { AccountRepo } from "../repository/Account.js";
import { ChatsWSService } from "./ChatsWSRoute.js";



/**
 * tutto sugli Account del progetto
 */
class AccountRoute extends httpRouter.Service {

	get stateDefault() {
		return {
			...super.stateDefault,
			path: "/accounts",
			routers: [
				{ path: "/", verb: "get", method: "getAll" },
				{ path: "/:id", verb: "get", method: "getById" },
				{ path: "/", verb: "patch", method: "update" },
				{ path: "/github/:id", verb: "get", method: "getByGithubUserId" },
			]
		}
	}
	declare state: typeof this.stateDefault

	/**
	 * Restituisce un certo numero di ACCOUNTS (10 di default) 
	 * eventualmente filtrati su testo libero
	 */
	async getAll(req: Request, res: Response) {
		const { text } = req.query as { text?: string };

		// preparo le opzioni di ricerca
		let findOptions: FindManyOptions<AccountRepo> = { take: 10 }
		if (!!text && text.trim().length > 0) {
			const searchText = `%${text.trim()}%`;
			findOptions.where = [
				{ name: Like(searchText) },
				{ email: Like(searchText) },
				{ googleEmail: Like(searchText) },
				{ githubName: Like(searchText) },
			];
		}
		// eseguo la ricerca
		const accounts: AccountRepo[] = await new Bus(this, REPO_PATHS.ACCOUNTS).dispatch({
			type: typeorm.Actions.FIND,
			payload: findOptions
		})

		// aggiorno lo status online/offline
		const chats = this.nodeByPath<ChatsWSService>("/>ws-chats")
		for (const account of accounts) {
			const isOnline = !!chats.chatContext.getUserById(account.id)
			account.status = isOnline ? ACCOUNT_STATUS.ONLINE : ACCOUNT_STATUS.OFFLINE
		}

		res.json({
			accounts: AccountDTOList(accounts)
		})
	}

	/**
	 * Restituisce l'ACCOUNT, se esiste, dato il suo ID
	 */
	async getById(req: Request, res: Response) {
		const id = req.params["id"]
		if (!id) return res.status(400).json({ error: "Missing id parameter" })

		const account: AccountRepo = await new Bus(this, REPO_PATHS.ACCOUNTS).dispatch({
			type: typeorm.Actions.GET_BY_ID,
			payload: id
		})
		if (!account) return res.status(404).json({ error: "Account not found" })

		res.json({
			account: AccountDTO(account)
		})
	}

	/**
	 * Return the ACCOUNT, if exist, by the GITHUB user id
	 */
	async getByGithubUserId(req: Request, res: Response) {
		const githubId = parseInt(req.params.id)
		if (isNaN(githubId)) return res.status(400).json({ error: "Invalid GitHub ID" })

		const account: AccountRepo = await new Bus(this, REPO_PATHS.ACCOUNTS).dispatch({
			type: typeorm.Actions.FIND_ONE,
			payload: <FindManyOptions<AccountRepo>>{
				where: { githubId: githubId },
			}
		})
		res.json({
			account: AccountDTO(account),
		})
	}

	/**
	 * Aggiorno i dati aggiornabili di un ACCOUNT
	 */
	async update(req: Request, res: Response) {
		const userJwt: JWTPayload = req["jwtPayload"]
		if (!userJwt) return res.status(401).json({ error: "Unauthorized" })

		const { account } = req.body;
		if (!account) return res.status(400).json({ error: "Missing account data" });
		if (account.name == null || account.name.trim().length == 0) return res.status(400).json({ error: "Invalid name" });

		const newAccount: Partial<AccountRepo> = {
			id: userJwt.id,
			name: account.name,
			language: account.language ?? undefined,
			notificationsEnabled: account.notificationsEnabled ?? undefined,
		}

		const savedAccount = await new Bus(this, REPO_PATHS.ACCOUNTS).dispatch({
			type: typeorm.Actions.SAVE,
			payload: newAccount
		});

		res.json({
			account: savedAccount(savedAccount)
		});
	}
}

export default AccountRoute


