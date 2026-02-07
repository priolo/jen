import { createStore, StoreCore } from "@priolo/jon"
import accountApi from "@/api/account"
import { AccountDTO } from "@shared/types/AccountDTO"
import { wsConnection } from "@/plugins/session/wsConnection"


/**
 * Gestisce gli ACCOUNT registrati nel sistema 
 */
const setup = {

	state: {
	},

	getters: {

	},

	actions: {
		//#region OVERWRITE
		//#endregion

		// async fetchIfVoid(_: void, store?: AccountStore) {
		// 	if (!!store.state.all) return
		// 	await store.fetch()
		// },

	},

	mutators: {
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
