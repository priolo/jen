import accountApi from "@/api/account"
import viewSetup, { ViewStore } from "@/stores/stacks/viewBase"
import { EDIT_STATE } from "@/types"
import { AccountDTO } from "@shared/types/AccountDTO"
import { mixStores } from "@priolo/jon"
import { ViewState } from "../viewBase"


/**
 * Gestione della CARD del dettaglio di un ACCOUNT
 */
const setup = {

	state: {
		//#region VIEWBASE
		width: 165,
		//#endregion

		account: <AccountDTO>null,
		accountId : <string>null,
		editState: EDIT_STATE.READ,
	},

	getters: {

		//#region VIEWBASE

		getTitle: (_: void, store?: ViewStore) => (<AccountDetailStore>store).state.account?.name?.toUpperCase() ?? "ACCOUNT DETAIL",
		getSubTitle: (_: void, store?: ViewStore) => "DETAIL ACCOUNT",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as AccountDetailState
			return {
				...viewSetup.getters.getSerialization(null, store),
				accountId: state.account?.id,
			}
		},

		//#endregion
	},

	actions: {

		//#region VIEWBASE

		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as AccountDetailState
			state.accountId = data.accountId
		},

		//#endregion


		async fetch(_: void, store?: AccountDetailStore) {
			const accountId = store.state.accountId ?? store.state.account?.id
			if (!accountId) return
			const account = (await accountApi.get(accountId, { store, manageAbort: true }))?.account
			store.setAccount(account)
		},
		async fetchIfVoid(_: void, store?: AccountDetailStore) {
			if (!!store.state.account) return
			await store.fetch()
		},
	},

	mutators: {
		setAccount: (account: AccountDTO) => ({ account }),
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


