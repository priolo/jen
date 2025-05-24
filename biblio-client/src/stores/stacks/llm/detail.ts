import llmApi from "@/api/llm"
import viewSetup, { ViewMutators, ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE, EDIT_STATE } from "@/types"
import { Llm } from "@/types/Llm"
import { MESSAGE_TYPE, utils } from "@priolo/jack"
import { mixStores } from "@priolo/jon"
import { LlmListState, LlmListStore } from "./list"
import llmSo from "./repo"




const setup = {

	state: {

		/** llm visualizzato */
		llm: <Partial<Llm>>null,

		editState: EDIT_STATE.READ,

		//#region VIEWBASE
		width: 200,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "LLM DETAIL",
		//#endregion

		getParentList: (_: void, store?: LlmDetailStore) => utils.findInRoot(store.state.group.state.all,
			{ type: DOC_TYPE.LLM_LIST }
		) as LlmListStore,


	},

	actions: {

		//#region VIEWBASE
		//#endregion

		fetch: async (_: void, store?: LlmDetailStore) => {
			if (!store.state.llm?.id) return
			const llm = await llmApi.get(store.state.llm.id, { store, manageAbort: true })
			store.setLlm(llm)
			//await loadBaseSetup.actions.fetch(_, store)
		},

		async fetchIfVoid(_: void, store?: LlmDetailStore) {
			if (!!store.state.llm.name) return
			await store.fetch()
		},

		/** crea un nuovo CONSUMER-INFO tramite CONSUMER-CONFIG */
		async save(_: void, store?: LlmDetailStore) {
			const llmSaved = await llmSo.save(store.state.llm)

			store.setLlm(llmSaved)
			store.setEditState(EDIT_STATE.READ)
			store.setSnackbar({
				open: true, type: MESSAGE_TYPE.SUCCESS, timeout: 5000,
				title: "SAVED",
				body: "you can find it in the LLM list",
			})
		},

		/** reset ENTITY */
		restore: (_: void, store?: LlmDetailStore) => {
			store.fetch()
			store.setEditState(EDIT_STATE.READ)
		},

	},

	mutators: {
		setLlm: (llm: Partial<Llm>) => ({ llm }),
		setEditState: (editState: EDIT_STATE) => ({ editState }),
	},
}

export type LlmDetailState = typeof setup.state & ViewState
export type LlmDetailGetters = typeof setup.getters
export type LlmDetailActions = typeof setup.actions
export type LlmDetailMutators = typeof setup.mutators & ViewMutators
export interface LlmDetailStore extends ViewStore, LlmDetailGetters, LlmDetailActions, LlmDetailMutators {
	state: LlmDetailState
}
const llmDetailSetup = mixStores(viewSetup, setup) as typeof setup
export default llmDetailSetup
