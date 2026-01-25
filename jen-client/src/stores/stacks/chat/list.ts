import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { Chat } from "@/types/Chat"
import { focusSo, loadBaseSetup, LoadBaseStore, MESSAGE_TYPE, VIEW_SIZE } from "@priolo/jack"
import { mixStores } from "@priolo/jon"
import { ChatDetailStore } from "./detail"
import { buildChatDetail, buildChatDetailNew } from "./factory"
import chatWSSo from "./ws"
import chatRepoSo from "./repo"



const setup = {

	state: {
		//#region VIEWBASE
		width: 370,
		widthMax: 1000,
		//#endregion
	},

	getters: {
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "CHATS",
		getSubTitle: (_: void, store?: ViewStore) => "chats list",
		//#endregion

	},

	actions: {

		//#region OVERRIDE VIEWBASE

		// setSerialization: (data: any, store?: LlmListStore) => {
		// 	viewSetup.actions.setSerialization(data, store)
		// 	const state = store.state as LlmListState
		// },

		//#endregion

		//#region OVERRIDE LOADBASE

		async fetch(_: void, store?: LoadBaseStore) {
		},

		//#endregion

		/** apro/chiudo la CARD del dettaglio */
		select(chatId: string, store?: ChatListStore) {
			const chat = chatRepoSo.getById(chatId)
			if (!chatId || !chat) return
			const detached = focusSo.state.shiftKey
			const oldId = (store.state.linked as ChatDetailStore)?.state?.chat?.id
			const newId = (chatId && oldId !== chatId) ? chatId : null

			if (detached) {
				const view = buildChatDetail({ chat, size: VIEW_SIZE.NORMAL })
				store.state.group.add({ view, index: store.state.group.getIndexByView(store) + 1 })
			} else {
				const view = newId ? buildChatDetail({ chat }) : null
				store.state.group.addLink({ view, parent: store, anim: !oldId || !newId })
			}
		},

		create(_: void, store?: ChatListStore) {
			const view = buildChatDetailNew()
			store.state.group.addLink({ view, parent: store, anim: true })
		},

		async delete(chatId: string, store?: ChatListStore) {
			if (!await store.alertOpen({
				title: "CHAT DELETION",
				body: "This action is irreversible.\nAre you sure you want to delete the CHAT?",
			})) return

			// chatRepoSo.delete(chatId)

			store.state.group.addLink({ view: null, parent: store, anim: true })

			store.setSnackbar({
				open: true, type: MESSAGE_TYPE.SUCCESS, timeout: 5000,
				title: "DELETED",
				body: "it is gone forever",
			})
		},

	},

	mutators: {
		setAll: (all: Chat[]) => ({ all }),
	},
}

export type ChatListState = typeof setup.state & ViewState
export type ChatListGetters = typeof setup.getters
export type ChatListActions = typeof setup.actions
export type ChatListMutators = typeof setup.mutators
export interface ChatListStore extends LoadBaseStore, ViewStore, ChatListGetters, ChatListActions, ChatListMutators {
	state: ChatListState
}
const chatListSetup = mixStores(viewSetup, loadBaseSetup, setup)
export default chatListSetup

