import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE } from "@/types"
import { mixStores } from "@priolo/jon"
import { ContentAskTo, LlmResponse } from "@shared/types/LlmResponse"
import { buildAgentList } from "../../agent/factory"
import agentSo from "../../agent/repo"
import chatRepoSo from "../../chat/repo"
import chatWSSo from "../../chat/ws"
import { EditorState } from "../../editorBase"
import { buildRoomAgentList, buildRoomDetail } from "../factory"
import { ChatMessage } from "@shared/types/ChatMessage"



const setup = {

	state: {

		// Id della CHAT. Settato in creazione
		chatId: <string>null,
		// Id della ROOM. Settato in creazione
		roomId: <string>null,

		agentsIds: <string[]>[],

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
				chatId: state.chatId,
				roomId: state.roomId,
			}
		},

		//#endregion

		/** se la lista degli AGENTS è aperta */
		getRoomAgentsOpen: (_: void, store?: RoomDetailStore) => store.state.linked?.state.type == DOC_TYPE.ROOM_AGENT_LIST,
		/** se la DETAIL della ROOM è aperta */
		getRoomDetailOpen: (_: void, store?: RoomDetailStore) => store.state.linked?.state.type == DOC_TYPE.ROOM_DETAIL,
		/** la ROOM */
		getRoom: (_: void, store?: RoomDetailStore) =>
			chatRepoSo.getRoom({
				chatId: store.state.chatId,
				roomId: store.state.roomId,
			}
		),
		// getAgents: (_: void, store?: RoomDetailStore) => {
		// 	return store.getRoom()?.agentsIds?.map(agentId => agentSo.getById(agentId)) ?? []
		// }
	},

	actions: {

		//#region VIEWBASE

		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as RoomDetailState
			state.chatId = data.chatId
			state.roomId = data.roomId
		},
		/** chiamata quando la CARD è stata costruita (vedere la build) */
		// onCreated: async (_: void, store?: ViewStore) => {
		// },

		onRemoval(_: void, store?: ViewStore) {
			const roomSo = store as RoomDetailStore
			chatWSSo.removeView({ chatId: roomSo.state.chatId, viewId: roomSo.state.uuid })
		},

		//#endregion

		/** 
		 * chiamata sul MOUNTH del componente  
		 * richiesta INFO CHAT
		 * */
		fetch: async (_: void, store?: RoomDetailStore) => {
			chatWSSo.enter(store.state.chatId)
			// recupero i dati della ROOM
			//const room = await roomApi.get(store.state.roomId, { store, manageAbort: true } )
		},


		/** invio un messaggio scritto dall'utente */
		sendPrompt: async (_: void, store?: RoomDetailStore) => {
			chatWSSo.appendMessage({
				chatId: store.state.chatId,
				roomId: store.state.roomId,
				text: store.state.prompt
			})
			// cancella la text
			store.setPrompt("")
		},


		/** apertura della CARD LIST AGENTS */
		openAgents(_: void, store?: RoomDetailStore) {
			const isOpen = store.getRoomAgentsOpen()
			const view = !isOpen ? buildRoomAgentList(store.state.roomId) : null
			store.state.group.addLink({ view, parent: store, anim: true })
		},
		/** ho cliccato su un MESSAGE che è linked ad una SUB-ROOM */
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
		setRoomId: (roomId: string) => ({ roomId }),
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

