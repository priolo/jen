export enum TOOL_TYPE {
	MCP = 'MCP',
	NODE = 'NODE',
	CODE = 'CODE'
}

/**
 * Dati di trasferimento
 */
export interface ToolDTO {
	id: string;
	accountId?: string;

	type?: TOOL_TYPE;
	name?: string;
	description?: string;
	parameters?: any;

	mcpId?: string;
	code?: string;
	pathNode?: string;

	agentsIds?: string[];
}
