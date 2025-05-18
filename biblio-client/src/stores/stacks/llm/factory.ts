import { buildStore } from "@/stores/docs/utils/factory";
import { DOC_TYPE } from "@/types";
import { LlmDetailState, LlmDetailStore } from "./detail";



export function buildLlmDetail(state:Partial<LlmDetailState>) {
	const cnnStore = buildStore({
		type: DOC_TYPE.LLM_DETAIL,
		...state,
	} as LlmDetailState) as LlmDetailStore;
	return cnnStore;
}

