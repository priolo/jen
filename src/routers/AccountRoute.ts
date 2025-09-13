import { AccountRepo } from "@/repository/Account.js";
import { Bus, httpRouter, typeorm } from "@priolo/julian";
import { Request, Response } from "express";



class AccountRoute extends httpRouter.Service {

	get stateDefault(): httpRouter.conf & any {
		return {
			...super.stateDefault,
			path: "/accounts",
			repository: "/typeorm/accounts",
			routers: [
				{ path: "/", verb: "get", method: "getAll" },
				{ path: "/:id", verb: "get", method: "getById" },
				{ path: "/", verb: "post", method: "create" },
				{ path: "/:id", verb: "delete", method: "delete" },
				{ path: "/:id", verb: "patch", method: "update" }
			]
		}
	}

	async getAll(req: Request, res: Response) {
		const users = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.RepoRestActions.ALL
		})
		res.json(users)
	}

	async getById(req: Request, res: Response) {
		const id = req.params["id"]
		const tool: AccountRepo = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.RepoRestActions.GET_BY_ID,
			payload: id
		})
		res.json(tool)
	}


	async create(req: Request, res: Response) {
		const { user }: { user: AccountRepo } = req.body
		const userNew: AccountRepo = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.RepoRestActions.SAVE,
			payload: user
		})
		res.json(userNew)
	}

	async delete(req: Request, res: Response) {
		const id = req.params["id"]
		await new Bus(this, this.state.repository).dispatch({
			type: typeorm.RepoRestActions.DELETE,
			payload: id
		})
		res.json({ data: "ok" })
	}

	async update(req: Request, res: Response) {
		const id = req.params["id"]
		const { user }: { user: AccountRepo } = req.body
		if (!id || !user) return
		const userUp = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.RepoRestActions.SAVE,
			payload: user,
		})
		res.json(userUp)
	}
}

export default AccountRoute


