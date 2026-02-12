import { deckCardsSo } from "@/stores/docs/cards"
import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { ACCOUNT_STATUS, AccountDTO } from "@shared/types/AccountDTO"
import { mixStores } from "@priolo/jon"
import chatWSSo from "./ws"
import { ViewState } from "../viewBase"
import { AccountDetailStore } from "../account/detail"
import { buildAccountDetail } from "../account/factory"
import chatRepoSo from "./repo"
import chatApi from "@/api/chat"



/**
 * Gestione della CARD della lista degli ACCOUNT registrati
 */
const setup = {

	state: {
		//#region VIEWBASE
		width: 170,
		//#endregion

		textSearch: <string>null,
		chatId: <string>null,
	},

	getters: {

		//#region VIEWBASE

		getTitle: (_: void, store?: ViewStore) => "ACCOUNTS",
		getSubTitle: (_: void, store?: ViewStore) => "List of accounts",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as ChatPartecipantsListState
			return {
				...viewSetup.getters.getSerialization(null, store),
				chatId: state.chatId,
			}
		},

		//#endregion

		/**
		 * I partecipanti alla CHAT con info di online/offline
		 */
		getUsers: (_: void, store?: ChatPartecipantsListStore): AccountDTO[] => {
			const chat = chatRepoSo.getById(store.state.chatId)
			if ( !chat || !chat.users) return []
			const chatOnline = chatWSSo.isOnline(store.state.chatId)
			const users = chat?.users?.map(user => ({
				...user,
				status: !chatOnline 
					? ACCOUNT_STATUS.UNKNOWN 
					: (chat?.onlineUserIds?.some(id => id == user.id) 
						? ACCOUNT_STATUS.ONLINE 
						: ACCOUNT_STATUS.OFFLINE
					),
			}))
			return users
		},

		

	},

	actions: {

		//#region VIEWBASE

		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as ChatPartecipantsListState
			state.chatId = data.chatId
		},

		//#endregion

		openDetail(accountId: string, store?: ChatPartecipantsListStore) {
			const accountIdSelected = (store.state.linked as AccountDetailStore)?.state?.accountId
			const view = accountIdSelected != accountId ? buildAccountDetail({ accountId }) : null
			deckCardsSo.addLink({ view, parent: store, anim: true })
		},

		/**
		 * manda un messaggio di INVITO all'account selezionato
		 */
		async invite(accountId: string, store?: ChatPartecipantsListStore) {
			const ret = await chatApi.inviteUser(store.state.chatId, accountId)
		},

		async remove(accountId: string, store?: ChatPartecipantsListStore) {
			const ret = await chatApi.removeUser(store.state.chatId, accountId)
		}

	},

	mutators: {
		setAll: (all: AccountDTO[]) => ({ all }),
		setTextSearch: (textSearch: string) => ({ textSearch })
	},
}


export type ChatPartecipantsListState = typeof setup.state & ViewState
export type ChatPartecipantsListGetters = typeof setup.getters
export type ChatPartecipantsListActions = typeof setup.actions
export type ChatPartecipantsListMutators = typeof setup.mutators
export interface ChatPartecipantsListStore extends ViewStore, ChatPartecipantsListGetters, ChatPartecipantsListActions, ChatPartecipantsListMutators {
	state: ChatPartecipantsListState
}
const chatPartecipantsListSetup = mixStores(viewSetup, setup)
export default chatPartecipantsListSetup


