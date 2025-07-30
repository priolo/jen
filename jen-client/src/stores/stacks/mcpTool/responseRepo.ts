import { ViewMutators, ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { createStore } from "@priolo/jon"
import { ToolMessage } from "./types"


/**
 * REPO PER LE RISPOSTE DEI TOOL MCP
 */
const setup = {

	state: {

		/** ALL RESPONSE */
		all: <ToolMessage[]>[],

	},

	getters: {
	},

	actions: {
		add: (response: ToolMessage, store?: ToolResponseStore) => {
			if (!response) return
			store.setAll([...store.state.all, response])
		}
	},

	mutators: {
		setAll: (all: ToolMessage[]) => ({ all }),
	},
}

export type ToolResponseState = typeof setup.state & ViewState
export type ToolResponseGetters = typeof setup.getters
export type ToolResponseActions = typeof setup.actions
export type ToolResponseMutators = typeof setup.mutators & ViewMutators
export interface ToolResponseStore extends ViewStore, ToolResponseGetters, ToolResponseActions, ToolResponseMutators {
	state: ToolResponseState
}

const toolResponseSo = createStore<ToolResponseState>(setup)
export default toolResponseSo as ToolResponseStore