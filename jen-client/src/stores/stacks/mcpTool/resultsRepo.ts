import { ViewMutators, ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { createStore } from "@priolo/jon"
import { ToolResult } from "./types"


/**
 * [REPO] tutti i RESULT dei TOOL MCP
 */
const setup = {

	state: {

		/** ALL RESULT */
		all: <ToolResult[]>[],

	},

	getters: {
	},

	actions: {
		add: (result: ToolResult, store?: ToolResultsStore) => {
			if (!result) return
			store.setAll([...store.state.all, result])
		}
	},

	mutators: {
		setAll: (all: ToolResult[]) => ({ all }),
	},
}

export type ToolResultsState = typeof setup.state & ViewState
export type ToolResultsGetters = typeof setup.getters
export type ToolResultsActions = typeof setup.actions
export type ToolResultsMutators = typeof setup.mutators & ViewMutators
export interface ToolResultsStore extends ViewStore, ToolResultsGetters, ToolResultsActions, ToolResultsMutators {
	state: ToolResultsState
}

const toolResultsSo = createStore<ToolResultsState>(setup)
export default toolResultsSo as ToolResultsStore