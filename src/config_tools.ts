import { ToolSchema } from "@priolo/julian-mcp";


/**
 * Definizione dei MCP TOOLS di sistema da inserire nel server allo startup
 */
const tools: ToolSchema[] = [
	{
		name: "sum",
		config: {
			title: "Tool for Addition",
			description: "Performs addition of two numbers",
			inputSchema: {
				type: "object",
				properties: { a: { type: "number" }, b: { type: "number" } },
				required: ["a", "b"]
			}
		},
		execute: async (args: { a: number, b: number }, extra: any) => {
			return {
				content: [
					{
						type: "text" as const,
						text: String(args.a + args.b)
					}
				]
			}
		}
	},
	{
		name: "subtract",
		config: {
			title: "Tool for Subtraction",
			description: "Performs subtraction of two numbers",
			inputSchema: {
				type: "object",
				properties: { a: { type: "number" }, b: { type: "number" } },
				required: ["a", "b"]
			}
		},
		execute: async (args: { a: number, b: number }, extra: any) => {
			return {
				content: [
					{
						type: "text" as const,
						text: String(args.a - args.b)
					}
				]
			}
		}
	}

]

export default tools