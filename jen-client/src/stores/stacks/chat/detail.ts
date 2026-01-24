import chatApi from "@/api/chat"
import viewSetup, { ViewMutators, ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE, EDIT_STATE } from "@/types"
import { Chat } from "@/types/Chat"
import { Llm } from "@/types/Llm"
import { focusSo, MESSAGE_TYPE, utils } from "@priolo/jack"
import { mixStores } from "@priolo/jon"
import { ChatListStore } from "./list"
import chatRepoSo from "./repo"
import { buildRoomDetail } from "../room/factory"
import { deckCardsSo } from "@/stores/docs/cards"




const setup = {

	state: {

		/** llm visualizzato */
		chat: <Partial<Chat>>null,

		editState: EDIT_STATE.READ,

		//#region VIEWBASE
		width: 200,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "CHAT DETAIL",
		//#endregion

		getParentList: (_: void, store?: ChatDetailStore) => utils.findInRoot(store.state.group.state.all,
			{ type: DOC_TYPE.CHAT_LIST }
		) as ChatListStore,


	},

	actions: {

		//#region VIEWBASE
		//#endregion

		/** carica ENTITY da API */
		fetch: async (_: void, store?: ChatDetailStore) => {
			if (!store.state.chat?.id) return
			const chat = await chatApi.get(store.state.chat.id, { store, manageAbort: true })
			store.setChat(chat)
			//await loadBaseSetup.actions.fetch(_, store)
		},
		/** carica ENTITY da API se non presente */
		async fetchIfVoid(_: void, store?: ChatDetailStore) {
			if (!!store.state.chat) return
			await store.fetch()
		},

		/** crea un nuovo CONSUMER-INFO tramite CONSUMER-CONFIG */
		async save(_: void, store?: ChatDetailStore) {
			const chatSaved = await chatRepoSo.save(store.state.chat)

			store.setChat(chatSaved)
			store.setEditState(EDIT_STATE.READ)
			store.setSnackbar({
				open: true, type: MESSAGE_TYPE.SUCCESS, timeout: 5000,
				title: "SAVED",
				body: "you can find it in the LLM list",
			})
		},

		/** reset ENTITY */
		restore: (_: void, store?: ChatDetailStore) => {
			store.fetch()
			store.setEditState(EDIT_STATE.READ)
		},




		/** apro la MAIN-ROOM */
		openMainRoom(_: void, store?: ChatListStore) {
			const view = buildRoomDetail()
			deckCardsSo.add({ view, anim: true })
		},

	},

	mutators: {
		setChat: (llm: Partial<Llm>) => ({ llm }),
		setEditState: (editState: EDIT_STATE) => ({ editState }),
	},
}

export type ChatDetailState = typeof setup.state & ViewState
export type ChatDetailGetters = typeof setup.getters
export type ChatDetailActions = typeof setup.actions
export type ChatDetailMutators = typeof setup.mutators & ViewMutators
export interface ChatDetailStore extends ViewStore, ChatDetailGetters, ChatDetailActions, ChatDetailMutators {
	state: ChatDetailState
}
const chatDetailSetup = mixStores(viewSetup, setup) as typeof setup
export default chatDetailSetup
