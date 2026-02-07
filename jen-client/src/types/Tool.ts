import { TOOL_TYPE, ToolDTO } from "@shared/types/ToolDTO";
import { Uuid } from "./global";

export { TOOL_TYPE } from "@shared/types/ToolDTO";

export class Tool implements ToolDTO {
	id: Uuid;
	accountId?: Uuid;

	type?: TOOL_TYPE;
	name?: string;
	description?: string;
	parameters?: any;

	mcpId?: Uuid;
	code?: string;
	pathNode?: string;

	agentsIds?: Uuid[];
}
