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
		add: (response: ToolMessage, store?: ToolMessageStore) => {
			if (!response) return
			store.setAll([...store.state.all, response])
		}
	},

	mutators: {
		setAll: (all: ToolMessage[]) => ({ all }),
	},
}

export type ToolMessageState = typeof setup.state & ViewState
export type ToolMessageGetters = typeof setup.getters
export type ToolMessageActions = typeof setup.actions
export type ToolMessageMutators = typeof setup.mutators & ViewMutators
export interface ToolMessageStore extends ViewStore, ToolMessageGetters, ToolMessageActions, ToolMessageMutators {
	state: ToolMessageState
}

const toolMessageSo = createStore<ToolMessageState>(setup)
export default toolMessageSo as ToolMessageStore