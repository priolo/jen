import { ToolRepo } from "@/repository/Tool.js";
import { Bus, httpRouter, typeorm } from "@priolo/julian";
import { Request, Response } from "express";



class ToolRoute extends httpRouter.Service {

	get stateDefault() {
		return {
			...super.stateDefault,
			path: "/tools",
			repository: "/typeorm/tools",
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
		const tools = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.Actions.ALL
		})
		res.json({ tools })
	}

	async getById(req: Request, res: Response) {
		const id = req.params["id"]
		const tool: ToolRepo = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.Actions.GET_BY_ID,
			payload: id
		})
		res.json({ tool })
	}


	async create(req: Request, res: Response) {
		const { tool }: { tool: ToolRepo } = req.body
		const toolNew: ToolRepo = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.Actions.SAVE,
			payload: tool
		})
		res.json({ tool: toolNew })
	}

	async update(req: Request, res: Response) {
		const id = req.params["id"]
		const { tool }: { tool: ToolRepo } = req.body
		if (!id || !tool) return
		const toolUp = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.Actions.SAVE,
			payload: tool,
		})
		res.json({ tool: toolUp })
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

export default ToolRoute


