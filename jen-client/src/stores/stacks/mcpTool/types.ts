import { McpTool } from "@/types/McpServer"


/**
 * Il risultato di un execuzione di TOOL MCP
 */
export interface ToolResult {
	/** server dove è presente il tool */
	mcpServerId: string | null
	/** tool utilizzato */
	mcpTool: McpTool | null
	/** i dati inviati */
	request: any,
	/** i dati ricevuti */
	response: McpToolResponse
}

export interface McpToolResponse {
  content: Content[];
  isError?: boolean;
}

export interface Content {
  type: "text" | "image" | "resource";
  text?: string;      // for type: "text"
  data?: string;      // for type: "image" (base64)
  mimeType?: string;  // for type: "image"
  uri?: string;       // for type: "resource"
}