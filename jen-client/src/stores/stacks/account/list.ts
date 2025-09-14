import { deckCardsSo } from "@/stores/docs/cards"
import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { mixStores } from "@priolo/jon"
import { ViewState } from "../viewBase"
import { buildAccountDetailCard } from "./factory"
import accountSo from "./repo"


/**
 * Gestione della CARD della lista degli ACCOUNT registrati
 */
const setup = {

	state: {
		//#region VIEWBASE
		//#endregion
	},

	getters: {
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "ACCOUNTS",
		getSubTitle: (_: void, store?: ViewStore) => "List of accounts",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as AccountListState
			return {
				...viewSetup.getters.getSerialization(null, store),
			}
		},
		//#endregion

		/** gli USERS filtrati e da visualizzare in lista */
		getFiltered(_: void, store?: AccountListStore) {
			return accountSo.state.all
			// const text = store.state.textSearch?.toLocaleLowerCase()?.trim()
			// if (!text || text.trim().length == 0 || !store.state.all) return store.state.all
			// return store.state.all.filter(user =>
			// 	user.name.toLowerCase().includes(text)
			// )
		},
	},

	actions: {
		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
		},
		//#endregion

		openDetail(accountId: string, store?: AccountListStore) {
			const view = buildAccountDetailCard({ id: accountId })
			deckCardsSo.addLink({ view, parent: store, anim: true })
		}
	},

	mutators: {
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


