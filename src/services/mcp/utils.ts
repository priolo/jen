import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { McpTool } from "./types.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";



export async function getMcpTools(mcpHost: string): Promise<McpTool[]> {
	let client: Client = new Client({
		name: 'streamable-http-client',
		version: '1.0.0'
	});
	const transport = new StreamableHTTPClientTransport(new URL(mcpHost))
	await client.connect(transport);
	// Lista i tool disponibili
	const resp: { tools: McpTool[] } = await client.listTools() as any
	await client.close();

	return resp.tools
}

export async function executeMcpTool(mcpHost: string, toolName: string, args: any): Promise<any> {
	let client: Client = new Client({
		name: 'streamable-http-client',
		version: '1.0.0'
	});
	const transport = new StreamableHTTPClientTransport(new URL(mcpHost))
	await client.connect(transport);
	const resp = await client.callTool({
		name: toolName,
		arguments: args
	})
	await client.close();

	return resp
}