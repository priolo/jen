import { executeMcpTool, getMcpTools } from "@/services/mcp/utils.js";
import { Bus, httpRouter, INode, typeorm } from "@priolo/julian";
import { Request, Response } from "express";
import { McpServerRepo } from "../repository/McpServer.js";



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
				{ path: "/:id", verb: "patch", method: "update" },
				{ path: "/:id/resources", verb: "get", method: "resources" },
				{ path: "/:id/:tool/execute", verb: "post", method: "executeTool" },
			]
		}
	}

	public static async GetById(mcpId: string, node: INode, repository: string): Promise<McpServerRepo> {
		const mcpServer = await new Bus(node, repository).dispatch<McpServerRepo>({
			type: typeorm.RepoRestActions.GET_BY_ID,
			payload: mcpId
		})
		return mcpServer
	}

	async getAll(req: Request, res: Response) {
		const mcpServer = await new Bus(this, this.state.repository).dispatch<McpServerRepo>({
			type: typeorm.RepoRestActions.ALL
		})
		res.json(mcpServer)
	}

	async create(req: Request, res: Response) {
		const { mcpServer }: { mcpServer: McpServerRepo } = req.body
		const mcpServerNew = await new Bus(this, this.state.repository).dispatch<McpServerRepo>({
			type: typeorm.RepoRestActions.SAVE,
			payload: mcpServer
		})
		res.json(mcpServerNew)
	}

	async delete(req: Request, res: Response) {
		const id = req.params["id"]
		await new Bus(this, this.state.repository).dispatch<McpServerRepo>({
			type: typeorm.RepoRestActions.DELETE,
			payload: id
		})
		res.json({ data: "ok" })
	}

	async update(req: Request, res: Response) {
		const id = req.params["id"]
		const { mcpServer }: { mcpServer: McpServerRepo } = req.body
		if (!id || !mcpServer) return
		const mcpServerUp = await new Bus(this, this.state.repository).dispatch<McpServerRepo>({
			type: typeorm.RepoRestActions.SAVE,
			payload: mcpServer,
		})
		res.json(mcpServerUp)
	}

	async resources(req: Request, res: Response) {
		const id = req.params["id"]
		const mcpServer = await McpServerRoute.GetById(id, this, this.state.repository)
		if (!mcpServer) return

		const resp = await getMcpTools(mcpServer.host)
		this.log("mcp-server:tools", resp)
		res.json(resp)
	}

	async executeTool(req: Request, res: Response) {
		const id = req.params["id"]
		const tool = req.params["tool"]
		const mcpServer = await McpServerRoute.GetById(id, this, this.state.repository)
		if (!mcpServer) return

		const resp = await executeMcpTool(mcpServer.host, tool, req.body)
		res.json(resp)
	}

}

export default McpServerRoute


