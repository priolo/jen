import { buildStore } from "@/stores/docs/utils/factory";
import { DOC_TYPE } from "@/types";
import { RoomDetailState, RoomDetailStore } from "./detail/detail";
import { PromptListState, PromptListStore } from "./list";
import { RoomAgentsListState, RoomAgentsListStore } from "./detail/roomAgentsList";


/**
 * Crea una CARD di dettaglio ROOM
 * src\app\cards\room\detail\View.tsx
 * 
 */
export function buildRoomDetail(state: Partial<RoomDetailState> = {}) {
	const store = buildStore({
		type: DOC_TYPE.ROOM_DETAIL,
		...state,
	} as RoomDetailState) as RoomDetailStore;
	return store;
}

export function buildRoomList() {
	const store = buildStore({
		type: DOC_TYPE.ROOM_LIST,
	} as PromptListState) as PromptListStore
	return store;
}

export function buildRoomAgentList(roomId:string) {
	const store = buildStore({
		type: DOC_TYPE.ROOM_AGENT_LIST,
		roomId,
	} as RoomAgentsListState) as RoomAgentsListStore
	return store;
}