import { buildStore } from "@/stores/docs/utils/factory";
import { DOC_TYPE, EDIT_STATE } from "@/types";
import { VIEW_SIZE } from "@priolo/jack";
import { RoomDetailState, RoomDetailStore } from "./detail/detail";
import { PromptListState, PromptListStore } from "./list";



export function buildRoomDetail(state: Partial<RoomDetailState>) {
	const store = buildStore({
		type: DOC_TYPE.ROOM_DETAIL,
		...state,
	} as RoomDetailState) as RoomDetailStore;
	return store;
}

export function buildRoomDetailNew( agentId?: string ) {
	const store = buildStore({
		type: DOC_TYPE.ROOM_DETAIL,
		editState: EDIT_STATE.NEW,
		size: VIEW_SIZE.NORMAL,
		sizeForce: true,
		room: { agentId	}
	} as RoomDetailState) as RoomDetailStore;
	return store;
}

export function buildRoomList() {
	const store = buildStore({
		type: DOC_TYPE.ROOM_LIST,
	} as PromptListState) as PromptListStore
	return store;
}