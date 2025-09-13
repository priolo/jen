import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { mixStores } from "@priolo/jon"
import { ViewState } from "../viewBase"


/**
 * Gestione della CARD di dettaglio dell'utente loggato
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
			const state = store.state as AuthDetailState
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

export type AuthDetailState = typeof setup.state & ViewState
export type AuthDetailGetters = typeof setup.getters
export type AuthDetailActions = typeof setup.actions
export type AuthDetailMutators = typeof setup.mutators
export interface AuthDetailStore extends ViewStore, AuthDetailGetters, AuthDetailActions, AuthDetailMutators {
	state: AuthDetailState
}
const authDetailSetup = mixStores(viewSetup, setup)
export default authDetailSetup


