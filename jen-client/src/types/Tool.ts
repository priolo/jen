import { Uuid } from "./global";

export enum TOOL_TYPE {
	MCP = 'MCP',
	NODE = 'NODE',
	CODE = 'CODE'
}

export class Tool {
	id: Uuid
	type?: TOOL_TYPE
	name?: string
	description?: string
	parameters?: any
	mcpId?: Uuid
	code?: string
	pathNode?: string
}
