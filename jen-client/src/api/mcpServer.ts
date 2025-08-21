import ajax, { CallOptions } from "@/plugins/AjaxService"
import { McpServer, McpTool } from "@/types/McpServer"



/** INDEX */
function index(opt?: CallOptions): Promise<McpServer[]> {
	return ajax.get(`mcp_servers`, opt)
}

/** GET */
function get(id: string, opt?: CallOptions): Promise<McpServer> {
	return ajax.get(`mcp_servers/${id}`, opt)
}

/** CREATE NEW */
function create(mcpServer: Partial<McpServer>, opt?: CallOptions): Promise<McpServer> {
	return ajax.post(`mcp_servers`, { mcpServer }, opt)
}

/** UPDATE */
function update(mcpServer: Partial<McpServer>, opt?: CallOptions): Promise<McpServer> {
	return ajax.patch(`mcp_servers/${mcpServer.id}`, { mcpServer }, opt)
}

/** DELETE */
function remove(id: string, opt?: CallOptions): Promise<void> {
	return ajax.delete(`mcp_servers/${id}`, null, opt)
}


/** GET RESOURCES */
async function resources(mcpServerId: string, opt?: CallOptions): Promise<McpTool[]> {
	const tools = await ajax.get(`mcp_servers/${mcpServerId}/resources`)
	return tools
}

/** ESEGUE UN TOOL DEL MCP */
async function execute(mcpServerId: string, mcpToolName: string, formData: any, opt?: CallOptions): Promise<any> {
	return ajax.post(`mcp_servers/${mcpServerId}/${mcpToolName}/execute`, formData, opt)
}

const mcpServerApi = {
	index,
	get,
	create,
	update,
	remove,

	resources,
	execute,
}
export default mcpServerApi