import { ProviderRepo } from "@/repository/Provider.js";
import { Bus, httpRouter, typeorm } from "@priolo/julian";
import { Request, Response } from "express";



class ProviderRoute extends httpRouter.Service {

	get stateDefault() {
		return {
			...super.stateDefault,
			path: "/providers",
			repository: "/typeorm/providers",
			routers: [
				{ path: "/", verb: "get", method: "getAll" },
				{ path: "/:id", verb: "get", method: "getById" },
				{ path: "/", verb: "post", method: "create" },
				{ path: "/:id", verb: "delete", method: "delete" },
				{ path: "/:id", verb: "patch", method: "update" }
			]
		}
	}
	declare state: typeof this.stateDefault

	async getAll(req: Request, res: Response) {
		const providers = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.RepoRestActions.ALL
		})
		res.json(providers)
	}

	async getById(req: Request, res: Response) {
		const id = req.params["id"]
		const provider: ProviderRepo = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.RepoRestActions.GET_BY_ID,
			payload: id
		})
		res.json(provider)
	}


	async create(req: Request, res: Response) {
		const { llm }: { llm: ProviderRepo } = req.body
		const llmNew: ProviderRepo = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.RepoRestActions.SAVE,
			payload: llm
		})
		res.json(llmNew)
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
		const { llm }: { llm: ProviderRepo } = req.body
		if (!id || !llm) return
		const llmUp = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.RepoRestActions.SAVE,
			payload: llm,
		})
		res.json(llmUp)
	}
}

export default ProviderRoute


