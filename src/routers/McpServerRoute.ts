import { McpServer } from "@/repository/MCPServer.js";
import { Bus, httpRouter, typeorm } from "@priolo/julian";
import { Request, Response } from "express";



class McpServerRoute extends httpRouter.Service {

	get stateDefault() {
		return {
			...super.stateDefault,
			path: "/mcp_servers",
			repository: "/typeorm/mcp_servers",
			routers: [
				{ path: "/", verb: "get", method: "getAll" },
				{ path: "/", verb: "post", method: "create" },
				{ path: "/:id", verb: "delete", method: "delete" },
				{ path: "/:id", verb: "patch", method: "update" }
			]
		}
	}

	async getAll(req: Request, res: Response) {
		const mcpServer = await new Bus(this, this.state.repository).dispatch<McpServer>({
			type: typeorm.RepoRestActions.ALL
		})
		res.json(mcpServer)
	}

	async create(req: Request, res: Response) {
		const { mcpServer }: { mcpServer: McpServer } = req.body
		const mcpServerNew = await new Bus(this, this.state.repository).dispatch<McpServer>({
			type: typeorm.RepoRestActions.SAVE,
			payload: mcpServer
		})
		res.json(mcpServerNew)
	}

	async delete(req: Request, res: Response) {
		const id = req.params["id"]
		await new Bus(this, this.state.repository).dispatch<McpServer>({
			type: typeorm.RepoRestActions.DELETE,
			payload: id
		})
		res.json({ data: "ok" })
	}

	async update(req: Request, res: Response) {
		const id = req.params["id"]
		const { mcpServer }: { mcpServer: McpServer } = req.body
		if (!id || !mcpServer) return
		const mcpServerUp = await new Bus(this, this.state.repository).dispatch({
			type: typeorm.RepoRestActions.SAVE,
			payload: mcpServer,
		})
		res.json(mcpServerUp)
	}
}

export default McpServerRoute


