import viewSetup, { ViewMutators, ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { McpTool } from "@/types/McpServer"
import { mixStores } from "@priolo/jon"
import mcpServerSo from "../mcpServer/repo"


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
		setMcpTool: (mcpTool: Partial<McpTool>) => ({ mcpTool }),
	},
}

export type ToolResponseListState = typeof setup.state & ViewState
export type ToolResponseListGetters = typeof setup.getters
export type ToolResponseListActions = typeof setup.actions
export type ToolResponseListMutators = typeof setup.mutators & ViewMutators
export interface ToolResponseListStore extends ViewStore, ToolResponseListGetters, ToolResponseListActions, ToolResponseListMutators {
	state: ToolResponseListState
}
const toolResponseListSetup = mixStores(viewSetup, setup) as typeof setup
export default toolResponseListSetup
