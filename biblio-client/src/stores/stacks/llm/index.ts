import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { Llm } from "@/types/Llm"
import { focusSo, loadBaseSetup, LoadBaseStore, VIEW_SIZE } from "@priolo/jack"
import { mixStores } from "@priolo/jon"
import { EditorState } from "../editorBase"
import { LlmDetailStore } from "./detail"
import { buildLlmDetail } from "./factory"



const setup = {

	state: {
		//#region VIEWBASE
		width: 370,
		widthMax: 1000,
		//#endregion
	},

	getters: {
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "LLM",
		getSubTitle: (_: void, store?: ViewStore) => "llm list",
		//#endregion
		
	},

	actions: {

		//#region VIEWBASE

		//#endregion

		//#region OVERWRITE

		//#endregion

		/** apro/chiudo la CARD del dettaglio */
		select(llmId: string, store?: LlmListStore) {
			const detached = focusSo.state.shiftKey
			const oldId = (store.state.linked as LlmDetailStore)?.state?.llm?.id
			const newId = (llmId && oldId !== llmId) ? llmId : null

			if (detached) {
				const view = buildLlmDetail({ llm: { id: llmId }, size: VIEW_SIZE.NORMAL })
				store.state.group.add({ view, index: store.state.group.getIndexByView(store) + 1 })
			} else {
				const view = newId ? buildLlmDetail({ llm: { id: llmId } }) : null
				//store.setSelect(newId)
				store.state.group.addLink({ view, parent: store, anim: !oldId || !newId })
			}
		},

	},

	mutators: {
		setAll: (all: Llm[]) => ({ all }),
	},
}

export type LlmListState = typeof setup.state & ViewState & EditorState
export type LlmListGetters = typeof setup.getters
export type LlmListActions = typeof setup.actions
export type LlmListMutators = typeof setup.mutators
export interface LlmListStore extends LoadBaseStore, ViewStore, LlmListGetters, LlmListActions, LlmListMutators {
	state: LlmListState
}
const llmListSetup = mixStores(viewSetup, loadBaseSetup, setup)
export default llmListSetup

