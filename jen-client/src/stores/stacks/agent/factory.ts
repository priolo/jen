import { buildStore } from "@/stores/docs/utils/factory";
import { DOC_TYPE, EDIT_STATE } from "@/types";
import { VIEW_SIZE } from "@priolo/jack";
import { AgentDetailState, AgentDetailStore } from "./detail";
import { AgentListState, AgentListStore } from "./list";



export function buildAgentDetail(state: Partial<AgentDetailState>) {
	const store = buildStore({
		type: DOC_TYPE.AGENT,
		...state,
	} as AgentDetailState) as AgentDetailStore;
	return store;
}

export function buildAgentDetailNew() {
	const store = buildStore({
		type: DOC_TYPE.AGENT,
		editState: EDIT_STATE.NEW,
		size: VIEW_SIZE.NORMAL,
		sizeForce: true,
		agent: {},
	} as AgentDetailState) as AgentDetailStore;
	return store;
}

export function buildAgentList() {
	const store = buildStore({
		type: DOC_TYPE.AGENT_LIST,
	} as AgentListState) as AgentListStore
	return store;
}
