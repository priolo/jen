import { REPO_PATHS } from "@/config.js";
import { AgentDTOFromAgentRepo, AgentDTOFromAgentRepoList, AgentRepo } from "../repository/Agent.js";
import { Bus, httpRouter, INode, typeorm } from "@priolo/julian";
import { Request, Response } from "express";
import { AccountRepo, JWTPayload } from "src/repository/Account.js";
import { FindManyOptions, FindOneOptions } from "typeorm";



class AgentRoute extends httpRouter.Service {

	public static async GetById(agentId: string, node: INode, repository: string): Promise<AgentRepo> {
		const agent: AgentRepo = await new Bus(node, repository).dispatch({
			type: typeorm.Actions.FIND_ONE,
			payload: <FindOneOptions<AgentRepo>>{
				where: { id: agentId },
				relations: ["tools", "subAgents", "llm"],
				select: {
					subAgents: { id: true, name: true, description: true },
					tools: {
						id: true, type: true, name: true, description: true,
						parameters: true, mcpId: true, code: true, pathNode: true
					},
					llm: { id: true, code: true, key: true }
				}
			}
		})
		return agent
	}


	get stateDefault() {
		return {
			...super.stateDefault,
			path: "/agents",
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
		const userJwt: AccountRepo = req["jwtPayload"]

		const agents: AgentRepo[] = await new Bus(this, REPO_PATHS.AGENTS).dispatch({
			type: typeorm.Actions.FIND,
			payload: <FindManyOptions<AgentRepo>>{
				where: [
					{ accountId: userJwt.id },
					{ accountId: null }
				],
				relations: ["tools", "subAgents"],
				select: {
					subAgents: { id: true },
					tools: { id: true }
				}
			}
		})
		res.json({ agents: AgentDTOFromAgentRepoList(agents) })
	}

	async getById(req: Request, res: Response) {
		const id = req.params["id"]
		const agent: AgentRepo = await AgentRoute.GetById(id, this, REPO_PATHS.AGENTS)
		res.json({ agent: AgentDTOFromAgentRepo(agent) })
	}

	async create(req: Request, res: Response) {
		const userJwt: JWTPayload = req["jwtPayload"]
		if (!userJwt) return res.status(401).json({ error: "Unauthorized" })

		const agent: AgentRepo = req.body?.agent
		const agentNew: AgentRepo = await new Bus(this, REPO_PATHS.AGENTS).dispatch({
			type: typeorm.Actions.SAVE,
			payload: {
				accountId: userJwt.id,
				...agent
			} as AgentRepo
		})
		res.json({ agent: AgentDTOFromAgentRepo(agentNew) })
	}

	async update(req: Request, res: Response) {
		const id = req.params["id"]
		const { agent }: { agent: AgentRepo } = req.body

		if (!id || !agent) {
			return res.status(400).json({ error: "Agent ID is required for an update." });
		}

		const agentUp: AgentRepo = await new Bus(this, REPO_PATHS.AGENTS).dispatch({
			type: typeorm.Actions.SAVE,
			payload: { ...agent, id },
		})
		if (!agentUp) {
			return res.status(404).json({ error: "Agent not found or update failed." });
		}
		res.json({ agent: AgentDTOFromAgentRepo(agentUp) })
	}

	async delete(req: Request, res: Response) {
		const userJwt: JWTPayload = req["jwtPayload"]
		if (!userJwt) return res.status(401).json({ error: "Unauthorized" })

		const id = req.params["id"]

		// Verifico che l'agente esista e appartenga all'utente
		const agent: AgentRepo = await new Bus(this, REPO_PATHS.AGENTS).dispatch({
			type: typeorm.Actions.FIND_ONE,
			payload: { where: { id } }
		})
		if (!agent) return res.status(404).json({ error: "Agent not found" })
		if (agent.accountId !== userJwt.id) return res.status(403).json({ error: "Forbidden" })

		await new Bus(this, REPO_PATHS.AGENTS).dispatch({
			type: typeorm.Actions.DELETE,
			payload: id
		})

		res.json({ data: "ok" })
	}
}

export default AgentRoute
