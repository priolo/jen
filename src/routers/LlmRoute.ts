import { Bus, httpRouter, typeorm } from "@priolo/julian";
import { Request, Response } from "express";
import { AccountRepo } from "src/repository/Account.js";
import { LlmRepo } from "src/repository/Llm.js";
import { FindManyOptions } from "typeorm";



class LlmRoute extends httpRouter.Service {

	get stateDefault() {
		return {
			...super.stateDefault,
			path: "/llms",
			repository: "/typeorm/llms",
			routers: [
				{ path: "/", verb: "get", method: "getAll" },
				{ path: "/:id", verb: "get", method: "getById" },
				{ path: "/", verb: "post", method: "create" },
				{ path: "/:id", verb: "patch", method: "update" },
				{ path: "/:id", verb: "delete", method: "delete" },
			]
		}
	}
	declare state: typeof this.stateDefault

	async getAll(req: Request, res: Response) {
		const userJwt: AccountRepo = req["jwtPayload"]

		const llms:LlmRepo[] = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.Actions.FIND,
			payload: <FindManyOptions<LlmRepo>>{
				where: [
					{ accountId: userJwt.id },
					{ accountId: null }
				],
			}
		})
		res.json({ llms })
	}

	async getById(req: Request, res: Response) {
		const id = req.params["id"]
		const llm: LlmRepo = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.Actions.GET_BY_ID,
			payload: id
		})
		res.json(llm)
	}


	async create(req: Request, res: Response) {
		const { llm }: { llm: LlmRepo } = req.body
		const llmNew: LlmRepo = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.Actions.SAVE,
			payload: llm
		})
		res.json(llmNew)
	}

	async update(req: Request, res: Response) {
		const id = req.params["id"]
		const { llm }: { llm: LlmRepo } = req.body
		if (!id || !llm) return
		const llmUp = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.Actions.SAVE,
			payload: llm,
		})
		res.json(llmUp)
	}

	async delete(req: Request, res: Response) {
		const id = req.params["id"]
		await new Bus(this, this.state.repository).dispatch({
			type: typeorm.Actions.DELETE,
			payload: id
		})
		res.json({ data: "ok" })
	}	
}

export default LlmRoute


