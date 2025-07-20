import { Log } from "@/stores/log/utils"
import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { StoreCore, mixStores } from "@priolo/jon"
import { ViewState } from "../viewBase"



const setup = {

	state: {
		//#region VIEWBASE
		pinnable: false,
		//#endregion
	},

	getters: {
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "USER",
		getSubTitle: (_: void, store?: ViewStore) => "YOU",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as AccountState
			return {
				...viewSetup.getters.getSerialization(null, store),
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

		select (log:Log, store?:AccountStore ) {
			store.state.group.focus(store.state.group.getById(log.targetId))
		},
	},

	mutators: {
	},
}

export type AccountState = typeof setup.state & ViewState
export type AccountGetters = typeof setup.getters
export type AccountActions = typeof setup.actions
export type AccountMutators = typeof setup.mutators
export interface AccountStore extends ViewStore, AccountGetters, AccountActions, AccountMutators {
	state: AccountState
}
const userSetup = mixStores(viewSetup, setup)
export default userSetup


