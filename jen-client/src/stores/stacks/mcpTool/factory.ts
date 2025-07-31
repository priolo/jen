import { buildStore } from "@/stores/docs/utils/factory";
import { DOC_TYPE } from "@/types";
import { McpToolDetailState, McpToolDetailStore } from "./detail";
import { ToolResponseListState, ToolResponseListStore } from "./responseList";



export function buildMcpToolDetail(state: Partial<McpToolDetailState>) {
	const store = buildStore({
		type: DOC_TYPE.MCP_TOOL_DETAIL,
		...state,
	} as McpToolDetailState) as McpToolDetailStore;
	return store;
}

export function buildToolListResponses(state: Partial<ToolResponseListState>) {
	const store = buildStore({
		type: DOC_TYPE.MCP_TOOL_RESPONSES,
		...state,
	} as ToolResponseListState) as ToolResponseListStore;
	return store;
}
