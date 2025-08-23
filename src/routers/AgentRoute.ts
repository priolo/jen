import { AgentRepo } from "@/repository/Agent.js";
import { Bus, httpRouter, INode, typeorm } from "@priolo/julian";
import { Request, Response } from "express";



class AgentRoute extends httpRouter.Service {

	public static async GetById(agentId: string, node: INode, repository: string): Promise<AgentRepo> {
		const agent: AgentRepo = await new Bus(node, repository).dispatch({
			type: typeorm.Actions.FIND_ONE,
			payload: {
				where: { id: agentId },
				relations: ["tools", "subAgents", "llm"],
				select: {
					subAgents: { id: true, name: true, description: true },
					tools: { id: true, name: true, description: true, parameters: true, mcpId: true },
					llm: { id: true, name: true, key: true }
				}
			}
		})
		return agent
	}

	get stateDefault(): httpRouter.conf & any {
		return {
			...super.stateDefault,
			path: "/agents",
			repository: "/typeorm/agents",
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
		const agents = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.RepoRestActions.ALL,
			payload: {
				relations: ["tools", "subAgents"],
				select: {
					subAgents: { id: true },
					tools: { id: true }
				}
			}
		})
		res.json(agents)
	}

	async getById(req: Request, res: Response) {
		const id = req.params["id"]
		const agent: AgentRepo = await AgentRoute.GetById(id, this, this.state.repository)
		res.json(agent)
	}

	async create(req: Request, res: Response) {
		const agent: AgentRepo = req.body?.agent
		const agentNew: AgentRepo = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.RepoRestActions.SAVE,
			payload: agent
		})
		res.json(agentNew)
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
		const { agent }: { agent: AgentRepo } = req.body

		if (!id) {
			return res.status(400).json({ error: "Agent ID is required for an update." });
		}

		// Ensure the ID from the path is used for the update
		const payload = { ...agent, id };

		try {
			const updatedAgent: AgentRepo = await new Bus(this, this.state.repository).dispatch({
				type: typeorm.RepoRestActions.SAVE,
				payload,
			})
			if (!updatedAgent) {
				return res.status(404).json({ error: "Agent not found or update failed." });
			}
			res.json(updatedAgent)
		} catch (e) {
			console.error("Error updating agent:", e)
			res.status(500).json({ error: "Failed to update agent." })
		}
	}
}

export default AgentRoute


