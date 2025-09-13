import { createStore, StoreCore } from "@priolo/jon"
import { Account } from "./types"


/**
 * Gestisce gli ACCOUNT registrati nel sistema 
 */
const setup = {

	state: {
		all: <Account[]>[],
	},

	getters: {

	},

	actions: {
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
