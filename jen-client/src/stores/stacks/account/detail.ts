import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { mixStores } from "@priolo/jon"
import { ViewState } from "../viewBase"


/**
 * Gestione della CARD del dettaglio di un ACCOUNT
 */
const setup = {

	state: {
		//#region VIEWBASE
		//#endregion
	},

	getters: {
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "ACCOUNT",
		getSubTitle: (_: void, store?: ViewStore) => "Detail account",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as AccountDetailState
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

		
	},

	mutators: {
	},
}

export type AccountDetailState = typeof setup.state & ViewState
export type AccountDetailGetters = typeof setup.getters
export type AccountDetailActions = typeof setup.actions
export type AccountDetailMutators = typeof setup.mutators
export interface AccountDetailStore extends ViewStore, AccountDetailGetters, AccountDetailActions, AccountDetailMutators {
	state: AccountDetailState
}
const accountDetailSetup = mixStores(viewSetup, setup)
export default accountDetailSetup


