import viewSetup, { ViewMutators, ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { mixStores } from "@priolo/jon"



/**
 * Gestisce la lista delle risposte dei tool MCP
 */
const setup = {

	state: {

		//#region VIEWBASE
		width: 200,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "RESPONSES LIST",
		getSubTitle: (_: void, store?: ViewStore) => "Responses list of MCP tool",
		//#endregion

		// getMcpServer: (_: void, store?: ToolResponseListStore) => {
		// 	return mcpServerSo.getById(store.state.mcpServerId)
		// },

	},

	actions: {
		//#region VIEWBASE
		//#endregion
	},

	mutators: {
	},
}

export type ToolMessageListState = typeof setup.state & ViewState
export type ToolMessageListGetters = typeof setup.getters
export type ToolMessageListActions = typeof setup.actions
export type ToolMessageListMutators = typeof setup.mutators & ViewMutators
export interface ToolMessageListStore extends ViewStore, ToolMessageListGetters, ToolMessageListActions, ToolMessageListMutators {
	state: ToolMessageListState
}
const toolMessageListSetup = mixStores(viewSetup, setup) as typeof setup
export default toolMessageListSetup
