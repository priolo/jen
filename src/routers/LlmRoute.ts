import { REPO_PATHS } from "@/config.js";
import { Bus, httpRouter, ServiceBase, typeorm } from "@priolo/julian";
import { Request, Response } from "express";
import { AccountRepo, JWTPayload } from "src/repository/Account.js";
import { LlmDTOFromLlmRepo, LlmDTOFromLlmRepoList, LlmRepo } from "src/repository/Llm.js";
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

		const llms: LlmRepo[] = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.Actions.FIND,
			payload: <FindManyOptions<LlmRepo>>{
				where: [
					{ accountId: userJwt.id },
					{ accountId: null }
				],
			}
		})
		res.json({ llms: LlmDTOFromLlmRepoList(llms) })
	}

	async getById(req: Request, res: Response) {
		const id = req.params["id"]
		const llm: LlmRepo = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.Actions.GET_BY_ID,
			payload: id
		})
		res.json({ llm: LlmDTOFromLlmRepo(llm) })
	}

	async create(req: Request, res: Response) {
		const { llm }: { llm: LlmRepo } = req.body
		const llmNew: LlmRepo = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.Actions.SAVE,
			payload: llm
		})
		res.json({ llm: LlmDTOFromLlmRepo(llmNew) })
	}

	async update(req: Request, res: Response) {
		const id = req.params["id"]
		const { llm }: { llm: LlmRepo } = req.body

		if (!id || !llm) {
			return res.status(400).json({ error: "LLM is required for an update." });
		}

		const llmUp = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.Actions.SAVE,
			payload: { ...llm, id },
		})
		if (!llmUp) {
			return res.status(404).json({ error: "Agent not found or update failed." });
		}
		res.json({ llm: LlmDTOFromLlmRepo(llmUp) })
	}

	async delete(req: Request, res: Response) {
		const userJwt: JWTPayload = req["jwtPayload"]
		const id = req.params["id"]
		const err = await IdentifyElementAccount(userJwt?.id, this, REPO_PATHS.LLMS, id)
		if (err) return res.status(403).json({ error: err })

		await new Bus(this, REPO_PATHS.LLMS).dispatch({
			type: typeorm.Actions.DELETE,
			payload: id
		})

		res.json({ data: "ok" })
	}
}

export default LlmRoute




async function IdentifyElementAccount(accountId: string, node: ServiceBase, repoPath: string, id: string) {
	if (!accountId) return "Unauthorized"

	// Verifico che l'agente esista e appartenga all'utente
	const item: LlmRepo = await new Bus(node, repoPath).dispatch({
		type: typeorm.Actions.FIND_ONE,
		payload: { where: { id } }
	})

	if (!item) return "Element not found"
	if (item.accountId !== accountId) return "Forbidden"
	return null
}
