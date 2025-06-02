import { Prompt } from "@/repository/Prompt.js";
import { Bus, httpRouter, typeorm } from "@priolo/julian";
import { Request, Response } from "express";


class PromptRoute extends httpRouter.Service {

	get stateDefault(): httpRouter.conf & any {
		return {
			...super.stateDefault,
			path: "/prompts",
			repository: "/typeorm/prompts",
			routers: [
				{ path: "/", verb: "get", method: "getAll" },
				{ path: "/:id", verb: "get", method: "getById" },
				{ path: "/", verb: "post", method: "create" },
				{ path: "/:id", verb: "delete", method: "delete" },
				{ path: "/:id", verb: "patch", method: "update" },
				{ path: "/:id/execute", verb: "post", method: "executeLlm" }
			]
		}
	}

	async getAll(req: Request, res: Response) {
		const prompts = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.RepoRestActions.ALL
		})
		res.json(prompts)
	}

	async getById(req: Request, res: Response) {
		const id = req.params["id"]
		const prompt: Prompt = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.RepoRestActions.GET_BY_ID,
			payload: id
		})
		res.json(prompt)
	}


	async create(req: Request, res: Response) {
		const { prompt }: { prompt: Prompt } = req.body
		const promptNew: Prompt = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.RepoRestActions.SAVE,
			payload: prompt
		})
		res.json(promptNew)
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
		const { prompt }: { prompt: Prompt } = req.body
		if (!id || !prompt) return
		const promptUp = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.RepoRestActions.SAVE,
			payload: prompt,
		})
		res.json(promptUp)
	}

}

export default PromptRoute
