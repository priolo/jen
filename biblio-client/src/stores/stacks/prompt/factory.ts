import { buildStore } from "@/stores/docs/utils/factory";
import { DOC_TYPE, EDIT_STATE } from "@/types";
import { VIEW_SIZE } from "@priolo/jack";
import { PromptDetailState, PromptDetailStore } from "./detail";
import { PromptListState, PromptListStore } from "./list";



export function buildPromptDetail(state: Partial<PromptDetailState>) {
	const store = buildStore({
		type: DOC_TYPE.PROMPT_DETAIL,
		...state,
	} as PromptDetailState) as PromptDetailStore;
	return store;
}

export function buildPromptDetailNew( agentId?: string ) {
	const store = buildStore({
		type: DOC_TYPE.PROMPT_DETAIL,
		editState: EDIT_STATE.NEW,
		size: VIEW_SIZE.NORMAL,
		sizeForce: true,
		prompt: { agentId }
	} as PromptDetailState) as PromptDetailStore;
	return store;
}

export function buildPromptList() {
	const store = buildStore({
		type: DOC_TYPE.PROMPT_LIST,
	} as PromptListState) as PromptListStore
	return store;
}