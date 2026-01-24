import { createUUID } from "@/stores/docs/utils/factory"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE } from "@/types"
import { ContentAskTo, LlmResponse } from "@/types/commons/LlmResponse"
import { ChatMessage } from "@/types/commons/RoomActions"
import { mixStores } from "@priolo/jon"
import { buildAgentList } from "../../agent/factory"
import chatSo from "../../chat/ws"
import { EditorState } from "../../editorBase"
import { buildRoomDetail } from "../factory"
import { buildAccountList } from "../../account/factory"
import docsSo from "@/stores/docs"



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


		getAgentsOpen: (_: void, store?: RoomDetailStore) => store.state.linked?.state.type == DOC_TYPE.AGENT_LIST,
		getAccountsOpen: (_: void, store?: RoomDetailStore) => store.state.linked?.state.type == DOC_TYPE.ACCOUNT_LIST,
		getRoomDetailOpen: (_: void, store?: RoomDetailStore) => store.state.linked?.state.type == DOC_TYPE.ROOM_DETAIL,
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
			chatSo.removeRoom({ chatId: roomSo.state.chatId, viewId: roomSo.state.uuid })
		},

		//#endregion

		/** 
		 * chiamata sul MOUNTH del componente  
		 * richiesta INFO CHAT
		 * */
		fetch: async (_: void, store?: RoomDetailStore) => {
			// se esiste chiedo dei suoi dati al BE
			if (!!store.state.chatId) {
				chatSo.request(store.state.chatId)
				return
			}
			// altrimenti chiedo la creazione nuova chat al BE
			store.state.chatId = createUUID()
			chatSo.create({
				chatId: store.state.chatId,
				agentIds: store.state.agentsIds
			})
		},


		/** invio un messaggio scritto dall'utente */
		sendPrompt: async (_: void, store?: RoomDetailStore) => {
			chatSo.appendMessage({
				chatId: store.state.chatId,
				roomId: store.state.roomId,
				text: store.state.prompt
			})
			// cancella la text
			store.setPrompt("")
		},


		/** apertura della CARD LIST AGENTS */
		openAgents(_: void, store?: RoomDetailStore) {
			const isOpen = store.getAgentsOpen()
			const view = !isOpen ? buildAgentList() : null
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
		/** apro gli ACCOUNTS che partecipano alla CHAT */
		openAccounts(_: void, store?: RoomDetailStore) {
			const isOpen = store.getAccountsOpen()
			const view = !isOpen ? buildAccountList() : null
			store.state.group.addLink({ view, parent: store, anim: true })
		}

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

