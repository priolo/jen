import ajax, { CallOptions } from "@/plugins/AjaxService"
import { McpServer } from "@/types/McpServer"



/** INDEX */
function index(opt?: CallOptions): Promise<McpServer[]> {
	return ajax.get(`mcp_servers`, opt)
}

/** GET */
function get(id: string, opt?: CallOptions): Promise<McpServer> {
	return ajax.get(`mcp_servers/${id}`, opt)
}

/** CREATE NEW */
function create(llm: Partial<McpServer>, opt?: CallOptions): Promise<McpServer> {
	return ajax.post(`mcp_servers`, { llm }, opt)
}

/** UPDATE */
function update(llm: Partial<McpServer>, opt?: CallOptions): Promise<McpServer> {
	return ajax.patch(`mcp_servers/${llm.id}`, { llm }, opt)
}

/** DELETE */
function remove(llmId: string, opt?: CallOptions): Promise<void> {
	return ajax.delete(`mcp_servers/${llmId}`, null, opt)
}


const mcpServerApi = {
	index,
	get,
	create,
	update,
	remove,
}
export default mcpServerApi