import { McpTool } from "@/types/McpServer"



export interface ToolMessage {
	/** server dove è presente il tool */
	mcpServerId: string | null
	/** tool utilizzato */
	mcpTool: McpTool | null
	/** i dati inviati */
	request: any,
	/** i dati ricevuti */
	response: any
}