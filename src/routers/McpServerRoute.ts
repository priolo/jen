import { Bus, httpRouter, typeorm } from "@priolo/julian";
import { Request, Response } from "express";
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"
import { McpServer } from "../repository/McpServer.js";



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
				{ path: "/:id/:tool/execute", verb: "post", method: "execute2" },
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
		const mcpServerUp = await new Bus(this, this.state.repository).dispatch<McpServer>({
			type: typeorm.RepoRestActions.SAVE,
			payload: mcpServer,
		})
		res.json(mcpServerUp)
	}

	async resources(req: Request, res: Response) {
		const id = req.params["id"]
		const mcpServer = await new Bus(this, this.state.repository).dispatch<McpServer>({
			type: typeorm.RepoRestActions.GET_BY_ID,
			payload: id
		})
		if ( !mcpServer) return

		let client: Client = new Client({
			name: 'streamable-http-client',
			version: '1.0.0'
		});
		const transport = new StreamableHTTPClientTransport(new URL(mcpServer.host))
		await client.connect(transport);
		this.log("mcp-server:connected", mcpServer.host)

		// Lista i tool disponibili
		const resp = await client.listTools()
		this.log("mcp-server:tools", resp)



		await client.close();

		res.json(resp)
	}

	async execute2(req: Request, res: Response) {
		const id = req.params["id"]
		const tool = req.params["tool"]
		const mcpServer = await new Bus(this, this.state.repository).dispatch<McpServer>({
			type: typeorm.RepoRestActions.GET_BY_ID,
			payload: id
		})
		if ( !mcpServer) return

		let client: Client = new Client({
			name: 'streamable-http-client',
			version: '1.0.0'
		});
		const transport = new StreamableHTTPClientTransport(new URL(mcpServer.host))
		await client.connect(transport);
		this.log("mcp-server:connected", mcpServer.host)

		const resp = await client.callTool({
			name: tool,
			arguments: req.body || {}
		})
		this.log("mcp-server:execute", resp)

		await client.close();

		res.json(resp)
	}

}

export default McpServerRoute


