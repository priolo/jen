import { Agent } from "@/repository/Agent.js";
import { Bus, httpRouter, typeorm } from "@priolo/julian";
import { Request, Response } from "express";
import { select } from "slate";



class AgentRoute extends httpRouter.Service {

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
			type: typeorm.RepoRestActions.ALL
		})
		res.json(agents)
	}

	async getById(req: Request, res: Response) {
		const id = req.params["id"]
		const agent: Agent = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.Actions.FIND_ONE,
			payload: {
				where: { id },
				relations: ["tools", "llm", "subAgents"],
				select: {
					subAgents: { id: true, name: true },
				}
			}
		})
		res.json(agent)
	}


	async create(req: Request, res: Response) {
		const { agent }: { agent: Agent } = req.body
		const agentNew: Agent = await new Bus(this, this.state.repository).dispatch({
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
		const { agent }: { agent: Agent } = req.body

		if (!id) {
			return res.status(400).json({ error: "Agent ID is required for an update." });
		}

		// Ensure the ID from the path is used for the update
		const payload = { ...agent, id };

		try {
			const updatedAgent: Agent = await new Bus(this, this.state.repository).dispatch({
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


