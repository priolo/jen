import chatApi from "@/api/chat"
import { deckCardsSo } from "@/stores/docs/cards"
import viewSetup, { ViewMutators, ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE, EDIT_STATE } from "@/types"
import { MESSAGE_TYPE, utils } from "@priolo/jack"
import { mixStores } from "@priolo/jon"
import { buildAccountList } from "../account/factory"
import { buildRoomDetail } from "../room/factory"
import { ChatListStore } from "./list"
import chatRepoSo from "./repo"
import chatWSSo from "./ws"
import { ChatDTO } from "@shared/types/ChatDTO"



const setup = {

	state: {

		/** llm visualizzato */
		chat: <Partial<ChatDTO>>null,
		chatId: <string>null,

		editState: EDIT_STATE.READ,

		//#region VIEWBASE
		width: 170,
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
			const chatId = store.state.chatId
			let chat = store.state.chat
			// se non ho la CHAT la prendo da API
			if (!chat) {
				chat = await chatApi.get(chatId, { store, manageAbort: true })
				store.setChat(chat)
			}
			// comunico al WS che sono in questa CHAT
			chatWSSo.enter(chatId)
		},

		onRemoval(_: void, store?: ViewStore) {
			const chatSo = store as ChatDetailStore
			chatWSSo.removeView({ chatId: chatSo.state.chatId, viewId: chatSo.state.uuid })
		},

		/** CREATE/UPDATE una CHAT */
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
			if (!store.state.chat?.id || !store.state.chat?.mainRoomId) return
			const view = buildRoomDetail({
				chatId: store.state.chat.id,
				roomId: store.state.chat.mainRoomId,
			})
			deckCardsSo.add({ view, anim: true })
		},

		/** apro gli ACCOUNTS che partecipano alla CHAT */
		openAccounts(_: void, store?: ChatDetailStore) {
			const isOpen = store.getAccountsOpen()
			const view = !isOpen ? buildAccountList({ chatId: store.state.chat?.id }) : null
			store.state.group.addLink({ view, parent: store, anim: true })
		}

	},

	mutators: {
		setChat: (chat: Partial<ChatDTO>) => ({ chat }),
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
