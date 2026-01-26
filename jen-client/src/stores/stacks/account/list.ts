import { deckCardsSo } from "@/stores/docs/cards"
import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { AccountDTO } from "@/types/account"
import { mixStores } from "@priolo/jon"
import chatWSSo from "../chat/ws"
import { ViewState } from "../viewBase"
import { AccountDetailStore } from "./detail"
import { buildAccountDetail } from "./factory"


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
			const state = store.state as AccountListState
			return {
				...viewSetup.getters.getSerialization(null, store),
				chatId: state.chatId,
			}
		},

		//#endregion

		getUsers: (_: void, store?: AccountListStore): AccountDTO[] => {
			const chat = chatWSSo.getChatById(store.state.chatId)
			if (!chat) return []
			return chat.clients ?? []
		},

	},

	actions: {

		//#region VIEWBASE

		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as AccountListState
			state.chatId = data.chatId
		},

		//#endregion

		openDetail(accountId: string, store?: AccountListStore) {
			const accountIdSelected = (store.state.linked as AccountDetailStore)?.state?.accountId
			const view = accountIdSelected != accountId ? buildAccountDetail({ accountId }) : null
			deckCardsSo.addLink({ view, parent: store, anim: true })
		},

		invite(accountId: string, store?: AccountListStore) {
			chatWSSo.invite({
				chatId: store.state.chatId,
				accountId: accountId,
			})
		}
	},

	mutators: {
		setAll: (all: AccountDTO[]) => ({ all }),
		setTextSearch: (textSearch: string) => ({ textSearch })
	},
}


export type AccountListState = typeof setup.state & ViewState
export type AccountListGetters = typeof setup.getters
export type AccountListActions = typeof setup.actions
export type AccountListMutators = typeof setup.mutators
export interface AccountListStore extends ViewStore, AccountListGetters, AccountListActions, AccountListMutators {
	state: AccountListState
}
const accountListSetup = mixStores(viewSetup, setup)
export default accountListSetup


