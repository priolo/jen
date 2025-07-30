import { buildStore } from "@/stores/docs/utils/factory";
import { DOC_TYPE } from "@/types";
import { McpToolDetailState, McpToolDetailStore } from "./detail";



export function buildMcpToolDetail(state:Partial<McpToolDetailState>) {
	const store = buildStore({
		type: DOC_TYPE.MCP_TOOL_DETAIL,
		...state,
	} as McpToolDetailState) as McpToolDetailStore;
	return store;
}
