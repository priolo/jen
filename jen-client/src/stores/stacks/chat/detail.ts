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
import { buildAccountList } from "../account/factory"




const setup = {

	state: {

		/** llm visualizzato */
		chat: <Partial<Chat>>null,
		chatId: <string>null,

		editState: EDIT_STATE.READ,

		//#region VIEWBASE
		width: 200,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "CHAT DETAIL",
		getSubTitle: (_: void, store?: ViewStore) => "chat detail",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as ChatDetailState
			return {
				...viewSetup.getters.getSerialization(null, store),
				chatId: state.chat.id,
			}
		},
		//#endregion

		getParentList: (_: void, store?: ChatDetailStore) => utils.findInRoot(store.state.group.state.all,
			{ type: DOC_TYPE.CHAT_LIST }
		) as ChatListStore,

		getAccountsOpen: (_: void, store?: ChatDetailStore) => store.state.linked?.state.type == DOC_TYPE.ACCOUNT_LIST,
	},

	actions: {

		//#region VIEWBASE

		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as ChatDetailState
			state.chatId = data.chatId
		},

		//#endregion

		/** carica ENTITY da API */
		fetch: async (_: void, store?: ChatDetailStore) => {
			const chatId = store.state.chatId ?? store.state.chat?.id
			if (!chatId) return
			const chat = await chatApi.get(chatId, { store, manageAbort: true })
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
		openMainRoom(_: void, store?: ChatDetailStore) {
			const view = buildRoomDetail({
				chatId: store.state.chat?.id,
			})
			deckCardsSo.add({ view, anim: true })
		},

		/** apro gli ACCOUNTS che partecipano alla CHAT */
		openAccounts(_: void, store?: ChatDetailStore) {
			const isOpen = store.getAccountsOpen()
			const view = !isOpen ? buildAccountList() : null
			store.state.group.addLink({ view, parent: store, anim: true })
		}

	},

	mutators: {
		setChat: (chat: Partial<Chat>) => ({ chat }),
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
