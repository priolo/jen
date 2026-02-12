import { buildStore } from "@/stores/docs/utils/factory";
import { DOC_TYPE, EDIT_STATE } from "@/types";
import { VIEW_SIZE } from "@priolo/jack";
import { ChatDetailState, ChatDetailStore } from "./detail";
import { ChatListState, ChatListStore } from "./list";



export function buildChatList() {
	const store = buildStore({
		type: DOC_TYPE.CHAT_LIST,
	} as ChatListState) as ChatListStore;
	return store;
}

export function buildChatDetailNew() {
	const store = buildStore({
		type: DOC_TYPE.CHAT_DETAIL,
		editState: EDIT_STATE.NEW,
		size: VIEW_SIZE.NORMAL,
		sizeForce: true,
		chatInEdit: {},
	} as ChatDetailState) as ChatDetailStore;
	return store;
}

export function buildChatDetail(state:Partial<ChatDetailState>) {
	const store = buildStore({
		type: DOC_TYPE.CHAT_DETAIL,
		...state,
	} as ChatDetailState) as ChatDetailStore;
	return store;
}
