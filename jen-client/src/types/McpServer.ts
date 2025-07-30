

export interface McpServer {
	id: string
	name: string
	host: string
	tools: McpTool[] 
}

export interface McpTool {
	name: string
	description: string
	inputSchema: any
	outputSchema: any
}
