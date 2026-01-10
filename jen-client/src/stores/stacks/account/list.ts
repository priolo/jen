import { deckCardsSo } from "@/stores/docs/cards"
import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { AccountDTO } from "@/types/account"
import { mixStores } from "@priolo/jon"
import { ViewState } from "../viewBase"
import { buildAccountDetail } from "./factory"


/**
 * Gestione della CARD della lista degli ACCOUNT registrati
 */
const setup = {

	state: {
		//#region VIEWBASE
		//#endregion
		textSearch: <string>null,
		all: <AccountDTO[]>[],
	},

	getters: {
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "ACCOUNTS",
		getSubTitle: (_: void, store?: ViewStore) => "List of accounts",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as AccountListState
			return {
				...viewSetup.getters.getSerialization(null, store),
				textSearch: state.textSearch,
			}
		},
		//#endregion
	},

	actions: {
		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
		},
		//#endregion

		openDetail(accountId: string, store?: AccountListStore) {
			const view = buildAccountDetail({ id: accountId })
			deckCardsSo.addLink({ view, parent: store, anim: true })
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


