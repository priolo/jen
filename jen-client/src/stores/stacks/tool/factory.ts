import { buildStore } from "@/stores/docs/utils/factory";
import { DOC_TYPE, EDIT_STATE } from "@/types";
import { VIEW_SIZE } from "@priolo/jack";
import { ToolDetailState, ToolDetailStore } from "./detail";
import { ToolListState, ToolListStore } from "./list";



export function buildToolDetail(state: Partial<ToolDetailState>) {
	const store = buildStore({
		type: DOC_TYPE.TOOL_DETAIL,
		...state,
	} as ToolDetailState) as ToolDetailStore;
	return store;
}

export function buildToolDetailNew() {
	const store = buildStore({
		type: DOC_TYPE.TOOL_DETAIL,
		editState: EDIT_STATE.NEW,
		size: VIEW_SIZE.NORMAL,
		sizeForce: true,
		tool: {
		},
	} as ToolDetailState) as ToolDetailStore;
	return store;
}

export function buildToolList() {
	const store = buildStore({
		type: DOC_TYPE.TOOL_LIST,
	} as ToolListState) as ToolListStore
	return store;
}