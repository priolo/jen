import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { mixStores } from "@priolo/jon"
import { ViewState } from "../viewBase"
import { Account } from "./types"
import { EDIT_STATE } from "@/types"
import accountApi from "@/api/account"


/**
 * Gestione della CARD del dettaglio di un ACCOUNT
 */
const setup = {

	state: {
		//#region VIEWBASE
		//#endregion

		account: <Partial<Account>>null,
		editState: EDIT_STATE.READ,
	},

	getters: {
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "ACCOUNT",
		getSubTitle: (_: void, store?: ViewStore) => "Detail account",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as AccountDetailState
			return {
				...viewSetup.getters.getSerialization(null, store),
				account: { id: state.account?.id }
			}
		},
		//#endregion
	},

	actions: {
		//#region VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			store.state = {...store.state, ...data }
		},
		//#endregion

		async fetch(_: void, store?: AccountDetailStore) {
			if (!store.state.account?.id) return
			const account = (await accountApi.get(store.state.account.id, { store, manageAbort: true }))?.account
			store.setAccount(account)
		},
		async fetchIfVoid(_: void, store?: AccountDetailStore) {
			if (!!store.state.account?.email) return
			await store.fetch()
		},
	},

	mutators: {
		setAccount: (account: Partial<Account>) => ({ account }),
		setEditState: (editState: EDIT_STATE) => ({ editState }),
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


