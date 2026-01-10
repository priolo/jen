import accountApi from "@/api/account"
import { deckCardsSo } from "@/stores/docs/cards"
import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { AccountDTO } from "@/types/account"
import { debounce } from "@/utils/time"
import { mixStores } from "@priolo/jon"
import { ViewState } from "../viewBase"
import { buildAccountDetail } from "./factory"


/**
 * Ricerca negli ACCOUNT registrati
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
		getSubTitle: (_: void, store?: ViewStore) => "Finder",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as AccountFinderState
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

		async fetchFiltered(_: void, store?: AccountFinderStore) {
			const accounts = (await accountApi.index({ text: store.state.textSearch }))?.accounts ?? []
			store.setAll(accounts)
		},

		openDetail(accountId: string, store?: AccountFinderStore) {
			const view = buildAccountDetail({ id: accountId })
			deckCardsSo.addLink({ view, parent: store, anim: true })
		}
	},

	mutators: {
		setAll: (all: AccountDTO[]) => ({ all }),
		setTextSearch: (textSearch: string, store?: AccountFinderStore) => {
			debounce(
				"AccountListView.setTextSearch",
				() => store.fetchFiltered(),
				500
			)
			return { textSearch }
		},
	},
}

export type AccountFinderState = typeof setup.state & ViewState
export type AccountFinderGetters = typeof setup.getters
export type AccountFinderActions = typeof setup.actions
export type AccountFinderMutators = typeof setup.mutators
export interface AccountFinderStore extends ViewStore, AccountFinderGetters, AccountFinderActions, AccountFinderMutators {
	state: AccountFinderState
}
const accountFinderSetup = mixStores(viewSetup, setup)
export default accountFinderSetup


