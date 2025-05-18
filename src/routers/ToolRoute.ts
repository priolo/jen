import { Agent } from "@/repository/Agent.js";
import { Bus, httpRouter, typeorm } from "@priolo/julian";
import { Request, Response } from "express"



class ToolRoute extends httpRouter.Service {

	get stateDefault(): httpRouter.conf & any {
		return {
			...super.stateDefault,
			path: "/tools",
			repository: "/typeorm/tools",
			routers: [
				{ path: "/", verb: "get", method: "getAll" },
				{ path: "/:id", verb: "get", method: "getById" },
				{ path: "/", verb: "post", method: "create" },
				{ path: "/:id", verb: "delete", method: "delete" },
				{ path: "/:id", verb: "patch", method: "update" }
			]
		}
	}

	async getAll(req: Request, res: Response)  {
		const agents = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.RepoRestActions.ALL
		})
		res.json(agents)
	}

	async getById(req: Request, res: Response) {
		const id = req.params["id"]
		const agent: Agent = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.RepoRestActions.GET_BY_ID,
			payload: id
		})
		res.json({ data: agent })
	}


	async create(req: Request, res: Response) {
		const { name } = req.body as { name: string }

		const agent:Agent = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.RepoRestActions.SAVE,
			payload: { name }
		})

		res.json({ data: agent })
	}

	async delete(req: Request, res: Response) {
		const id = req.params["id"]
		await new Bus(this, this.state.repository).dispatch({
			type: typeorm.RepoRestActions.DELETE,
			payload: id
		})
		res.json({ data: "ok" })
	}

	/** 
	 * aggiorna un DOC tramite un array di ACTIONS
	 */
	async update(req: Request, res: Response) {
		const id = req.params["id"]
		const body: { actions: BaseOperation[] } = req.body
		if (!id || !(body?.actions?.length > 0)) return

		// recupero il DOC interessato
		const doc: Doc = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.RepoRestActions.GET_BY_ID,
			payload: id
		})

		// applico le ACTIONS
		try {
			doc.children = applyOperations(body.actions, doc.children)
			await new Bus(this, this.state.repository).dispatch({
				type: typeorm.RepoRestActions.SAVE,
				payload: doc,
			})
			// TODO: memorizzare le ACTIONS nella history
		} catch (e) {
			console.error(e)
			// restituire errore!
		}

		res.json({ data: "ok" })
	}
}

export default ToolRoute


