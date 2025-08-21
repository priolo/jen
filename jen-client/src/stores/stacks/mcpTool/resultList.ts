import viewSetup, { ViewMutators, ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { mixStores } from "@priolo/jon"
import { ToolResult } from "./types"



/**
 * Gestisce la lista delle RESULT dei tool MCP
 */
const setup = {

	state: {
		/** id del servizio MCP da cui proviene il TOOL */
		mcpServerId: <string>null,
		/** nome univoco con scope MCP del TOOL */
		toolName: <string>null,
		
		//#region VIEWBASE
		width: 200,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "RESULTS LIST",
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

export type ToolResultListState = typeof setup.state & ViewState
export type ToolResultListGetters = typeof setup.getters
export type ToolResultListActions = typeof setup.actions
export type ToolResultListMutators = typeof setup.mutators & ViewMutators
export interface ToolResultListStore extends ViewStore, ToolResultListGetters, ToolResultListActions, ToolResultListMutators {
	state: ToolResultListState
}
const toolResultListSetup = mixStores(viewSetup, setup) as typeof setup
export default toolResultListSetup
