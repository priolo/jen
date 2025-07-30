import { buildStore } from "@/stores/docs/utils/factory";
import { DOC_TYPE, EDIT_STATE } from "@/types";
import { VIEW_SIZE } from "@priolo/jack";
import { McpServerDetailState, McpServerDetailStore } from "./detail";
import { McpServerListState, McpServerListStore } from "./list";



export function buildMcpServerDetail(state:Partial<McpServerDetailState>) {
	const store = buildStore({
		type: DOC_TYPE.MCP_SERVER_DETAIL,
		...state,
	} as McpServerDetailState) as McpServerDetailStore;
	return store;
}

export function buildMcpServerDetailNew() {
	const store = buildStore({
		type: DOC_TYPE.MCP_SERVER_DETAIL,
		editState: EDIT_STATE.NEW,
		size: VIEW_SIZE.NORMAL,
		sizeForce: true,
		mcpServer: {
			name: "",
			host: "",
		},
	} as McpServerDetailState) as McpServerDetailStore;
	return store;
}

export function buildMcpServerList() {
	const store = buildStore({
		type: DOC_TYPE.MCP_SERVER_LIST,
	} as McpServerListState) as McpServerListStore
	return store;
}