import mcpServerApi from "@/api/mcpServer"
import viewSetup, { ViewMutators, ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { McpTool } from "@/types/McpServer"
import { mixStores } from "@priolo/jon"
import mcpServerSo from "../mcpServer/repo"
import { buildToolListResponses } from "./factory"
import toolMessageSo from "./messageRepo"
import { McpToolResponse } from "./types"


const setup = {

	state: {

		/** server dove è presente il tool */
		mcpServerId: null,
		/** tool utilizzato */
		mcpTool: <Partial<McpTool>>null,
		/** dati da inviare */
		request: {},
		/** dati ricevuti */
		response: <McpToolResponse>null,

		//#region VIEWBASE
		width: 200,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "MCP TOOL DETAIL",
		getSubTitle: (_: void, store?: ViewStore) => "MCP tool detail",
		//#endregion

		getMcpServer: (_: void, store?: McpToolDetailStore) => {
			return mcpServerSo.getById(store.state.mcpServerId)
		},

	},

	actions: {

		//#region VIEWBASE
		//#endregion

		async execute(_: void, store?: McpToolDetailStore) {
			if (store.state.mcpTool == null) return
			const resp = await mcpServerApi.execute(
				store.state.mcpServerId,
				store.state.mcpTool.name,
				store.state.request
			)
			store.setResponse(resp)
			toolMessageSo.add({
				mcpServerId: store.state.mcpServerId,
				mcpTool: { ...store.state.mcpTool } as McpTool,
				request: store.state.request,
				response: resp,
			})
		},

		async openMessages(_: void, store?: McpToolDetailStore) {
			const view = buildToolListResponses({
			})
			store.state.group.addLink({ view, parent: store, anim: true })
		},

	},

	mutators: {
		setMcpTool: (mcpTool: Partial<McpTool>) => ({ mcpTool }),
		setRequest: (request: any) => ({ request }),
		setResponse: (response: any) => ({ response }),
	},
}

export type McpToolDetailState = typeof setup.state & ViewState
export type McpToolDetailGetters = typeof setup.getters
export type McpToolDetailActions = typeof setup.actions
export type McpToolDetailMutators = typeof setup.mutators & ViewMutators
export interface McpToolDetailStore extends ViewStore, McpToolDetailGetters, McpToolDetailActions, McpToolDetailMutators {
	state: McpToolDetailState
}
const mcpToolDetailSetup = mixStores(viewSetup, setup) as typeof setup
export default mcpToolDetailSetup
