import { Request, Response } from "express"
import { Bus, RepoRestActions, httpRouter } from "typexpress"
import { HttpRouterRestRepoServiceConf } from "typexpress/dist/services/http-router/rest/HttpRouterRestRepoService.js"



export default class UserRoute extends httpRouter.Service {

	get stateDefault() {
		return {
			...super.stateDefault,
			path: "/users",
			repository: "/typeorm/users",
			routers: [
				{ path: "/", verb: "get", method: "getAll" },
				{ path: "/:id", verb: "get", method: "getById" },
			]
		}
	}

	async getAll(req: Request, res: Response) {
		const { repository } = this.state
		const users = await new Bus(this, repository).dispatch({ type: RepoRestActions.ALL })
		for (const user of users) secureUser(user)
		res.json(users)
	}

	async getById(req: Request, res: Response) {
		const { repository } = this.state
		const id = req.params["id"]
		const user = await new Bus(this, repository).dispatch({ type: RepoRestActions.GET_BY_ID, payload: id })
		secureUser(user)
		res.json(user)
	}

}

function secureUser(user: any): void {
	if (!user) return
	user.password = (user.password && user.password.length > 0) ? "***" : ""
	user.salt = ""
}