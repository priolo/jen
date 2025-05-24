import { buildStore } from "@/stores/docs/utils/factory";
import { DOC_TYPE, EDIT_STATE } from "@/types";
import { LlmDetailState, LlmDetailStore } from "./detail";
import { VIEW_SIZE } from "@priolo/jack";
import { PROVIDER } from "@/types/Llm";
import { LlmListState, LlmListStore } from "./list";



export function buildLlmDetail(state:Partial<LlmDetailState>) {
	const store = buildStore({
		type: DOC_TYPE.LLM_DETAIL,
		...state,
	} as LlmDetailState) as LlmDetailStore;
	return store;
}

export function buildLlmDetailNew() {
	const store = buildStore({
		type: DOC_TYPE.LLM_DETAIL,
		editState: EDIT_STATE.NEW,
		size: VIEW_SIZE.NORMAL,
		sizeForce: true,
		llm: {
			provider: PROVIDER.GOOGLE,
		},
	} as LlmDetailState) as LlmDetailStore;
	return store;
}

export function buildLlmList() {
	const store = buildStore({
		type: DOC_TYPE.LLM_LIST,
	} as LlmListState) as LlmListStore
	return store;
}