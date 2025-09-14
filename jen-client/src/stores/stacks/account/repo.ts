import { createStore, StoreCore } from "@priolo/jon"
import { Account } from "./types"
import accountApi from "@/api/account"


/**
 * Gestisce gli ACCOUNT registrati nel sistema 
 */
const setup = {

	state: {
		all: <Account[]>null,
	},

	getters: {

	},

	actions: {
		//#region OVERWRITE
		async fetch(_: void, store?: AccountStore) {
			const accounts = await accountApi.index({ store })
			store.setAll(accounts)
			//await loadBaseSetup.actions.fetch(_, store)
		},
		//#endregion

		async fetchIfVoid(_: void, store?: AccountStore) {
			if (!!store.state.all) return
			await store.fetch()
		},

	},

	mutators: {
		setAll: (all: Account[]) => ({ all }),
	},
}

export type AccountState = typeof setup.state
export type AccountGetters = typeof setup.getters
export type AccountActions = typeof setup.actions
export type AccountMutators = typeof setup.mutators
export interface AccountStore extends StoreCore<AccountState>, AccountGetters, AccountActions, AccountMutators {
	state: AccountState
}

const accountSo = createStore<AccountState>(setup)
export default accountSo as AccountStore
