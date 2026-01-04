import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { mixStores } from "@priolo/jon"
import chatSo from "../../chat/repo"
import { EditorState } from "../../editorBase"
import { DOC_TYPE } from "@/types"
import { buildAgentList } from "../../agent/factory"
import { ChatMessage } from "@/types/commons/RoomActions"
import { ContentAskTo, LlmResponse } from "@/types/commons/LlmResponse"
import { buildRoomDetail } from "../factory"



const setup = {

	state: {

		// Id della CHAT. Settato in creazione
		chatId: <string>null,
		// Id della ROOM. Settato in creazione
		roomId: <string>null,

		// prompt della textbox in basso
		prompt: `Don't answer directly, but use the tools available to you.
What is 2+2? Just write the answer number.`,

		//#region VIEWBASE
		width: 370,
		widthMax: 1000,
		//#endregion
	},

	getters: {

		//#region VIEWBASE

		getTitle: (_: void, store?: ViewStore) => "ROOM",
		getSubTitle: (_: void, store?: ViewStore) => "room detail",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as RoomDetailState
			return {
				...viewSetup.getters.getSerialization(null, store),
				roomId: state.roomId,
			}
		},

		//#endregion


		getAgentsOpen: (_: void, store?: RoomDetailStore) => store.state.linked?.state.type == DOC_TYPE.AGENT_LIST,
		getRoomDetailOpen: (_: void, store?: RoomDetailStore) => store.state.linked?.state.type == DOC_TYPE.ROOM_DETAIL,
	},

	actions: {

		//#region VIEWBASE

		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as RoomDetailState
			state.roomId = data.roomId
		},
		/** chiamata quando la CARD è stata costruita (vedere la build) */
		// onCreated: async (_: void, store?: ViewStore) => {
		// },

		// onRemoval(_: void, store?: ViewStore) {
		// 	const roomSo = store as RoomDetailStore
		// 	chatSo.removeChat(roomSo.state.chatId)
		// },

		//#endregion


		/** invio un messaggio scritto dall'utente */
		sendPrompt: async (_: void, store?: RoomDetailStore) => {
			chatSo.addMessageToRoom({
				chatId: store.state.chatId,
				roomId: store.state.roomId,
				text: store.state.prompt
			})
			// cancella la text
			store.setPrompt("")
		},

		/** apertura della CARD LIST AGENNTS */
		openAgents(_: void, store?: RoomDetailStore) {
			const isOpen = store.getAgentsOpen()
			const view = !isOpen ? buildAgentList() : null
			store.state.group.addLink({ view, parent: store, anim: true })
		},

		openSubRoom(chatMessage: ChatMessage, store?: RoomDetailStore) {
			const content: ContentAskTo = (chatMessage?.content as LlmResponse)?.content as ContentAskTo
			if (!content) return
			const isOpen = store.getRoomDetailOpen()
			const view = !isOpen ? buildRoomDetail({
				chatId: store.state.chatId,
				roomId: content.roomId,
			}) : null
			store.state.group.addLink({ view, parent: store, anim: true })
		},
	},

	mutators: {
		setPrompt: (prompt: string) => ({ prompt }),
	},

}

export type RoomDetailState = typeof setup.state & ViewState & EditorState
export type RoomDetailGetters = typeof setup.getters
export type RoomDetailActions = typeof setup.actions
export type RoomDetailMutators = typeof setup.mutators
export interface RoomDetailStore extends ViewStore, RoomDetailGetters, RoomDetailActions, RoomDetailMutators {
	state: RoomDetailState
	onCreated: (_: void, store?: ViewStore) => Promise<void>;
}
const roomDetailSetup = mixStores(viewSetup, setup)
export default roomDetailSetup

