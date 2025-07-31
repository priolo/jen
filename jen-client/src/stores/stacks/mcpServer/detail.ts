import mcpServerApi from "@/api/mcpServer"
import viewSetup, { ViewMutators, ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE, EDIT_STATE } from "@/types"
import { McpServer, McpTool } from "@/types/McpServer"
import { MESSAGE_TYPE, utils } from "@priolo/jack"
import { mixStores } from "@priolo/jon"
import { McpServerListStore } from "./list"
import mcpServerSo from "./repo"
import { buildMcpToolDetail } from "../mcpTool/factory"



const setup = {

	state: {

		/** MCP server visualizzato */
		mcpServer: <Partial<McpServer>>null,

		editState: EDIT_STATE.READ,

		//#region VIEWBASE
		width: 200,
		//#endregion
	},

	getters: {

		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "MCP SERVER DETAIL",
		getSubTitle: (_: void, store?: ViewStore) => "MCP server detail",
		//#endregion

		getParentList: (_: void, store?: McpServerDetailStore) => utils.findInRoot(store.state.group.state.all,
			{ type: DOC_TYPE.MCP_SERVER_LIST }
		) as McpServerListStore,

		getMcpServer: (_: void, store?: McpServerDetailStore) => {
			if (store.state.editState == EDIT_STATE.READ) {
				return mcpServerSo.getById(store.state.mcpServer.id)
			}
			return store.state.mcpServer
		},


	},

	actions: {

		//#region VIEWBASE
		//#endregion

		/** crea un nuovo CONSUMER-INFO tramite CONSUMER-CONFIG */
		async save(_: void, store?: McpServerDetailStore) {
			const mcpServerSaved = await mcpServerSo.save(store.state.mcpServer)

			store.setMcpServer(mcpServerSaved)
			store.setEditState(EDIT_STATE.READ)
			store.setSnackbar({
				open: true, type: MESSAGE_TYPE.SUCCESS, timeout: 5000,
				title: "SAVED",
				body: "you can find it in the MCP list",
			})
		},

		/** reset ENTITY */
		restore: (_: void, store?: McpServerDetailStore) => {
			//store.fetch()
			//store.setEditState(EDIT_STATE.READ)
			store.setMcpServer(mcpServerSo.getById(store.state.mcpServer.id))
		},

		openTool: (tool: Partial<McpTool>, store?: McpServerDetailStore) => {
			const view = buildMcpToolDetail({
				mcpServerId: store.state.mcpServer.id,
				mcpTool: tool,
			})
			store.state.group.addLink({ view, parent: store, anim: true })
		}
	},

	mutators: {
		setMcpServer: (mcpServer: Partial<McpServer>) => ({ mcpServer }),
		setEditState: (editState: EDIT_STATE) => ({ editState }),
	},
}

export type McpServerDetailState = typeof setup.state & ViewState
export type McpServerDetailGetters = typeof setup.getters
export type McpServerDetailActions = typeof setup.actions
export type McpServerDetailMutators = typeof setup.mutators & ViewMutators
export interface McpServerDetailStore extends ViewStore, McpServerDetailGetters, McpServerDetailActions, McpServerDetailMutators {
	state: McpServerDetailState
}
const mcpServerDetailSetup = mixStores(viewSetup, setup) as typeof setup
export default mcpServerDetailSetup
