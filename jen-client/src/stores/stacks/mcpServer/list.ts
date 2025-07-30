import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { McpServer } from "@/types/McpServer"
import { focusSo, loadBaseSetup, LoadBaseStore, MESSAGE_TYPE, VIEW_SIZE } from "@priolo/jack"
import { mixStores } from "@priolo/jon"
import { McpServerDetailStore } from "./detail"
import { buildMcpServerDetail, buildMcpServerDetailNew } from "./factory"
import mcpServerSo from "./repo"



const setup = {

	state: {
		//#region VIEWBASE
		width: 370,
		widthMax: 1000,
		//#endregion
	},

	getters: {

		//#region VIEWBASE

		getTitle: (_: void, store?: ViewStore) => "MCP SERVERS",
		getSubTitle: (_: void, store?: ViewStore) => "MCP servers list",
		
		//#endregion

	},

	actions: {

		//#region OVERRIDE VIEWBASE

		//#endregion

		//#region OVERRIDE LOADBASE

		async fetch(_: void, store?: LoadBaseStore) {
			await mcpServerSo.fetch()
		},

		//#endregion

		/** apro/chiudo la CARD del dettaglio */
		select(id: string, store?: McpServerListStore) {
			const detached = focusSo.state.shiftKey
			const oldId = (store.state.linked as McpServerDetailStore)?.state?.mcpServer?.id
			const newId = (id && oldId !== id) ? id : null

			if (detached) {
				const view = buildMcpServerDetail({ mcpServer: { id: id }, size: VIEW_SIZE.NORMAL })
				store.state.group.add({ view, index: store.state.group.getIndexByView(store) + 1 })
			} else {
				const view = newId ? buildMcpServerDetail({ mcpServer: { id: id } }) : null
				//store.setSelect(newId)
				store.state.group.addLink({ view, parent: store, anim: !oldId || !newId })
			}
		},

		create(_: void, store?: McpServerListStore) {
			const view = buildMcpServerDetailNew()
			store.state.group.addLink({ view, parent: store, anim: true })
		},

		async delete(id: string, store?: McpServerListStore) {
			if (!await store.alertOpen({
				title: "CONSUMER DELETION",
				body: "This action is irreversible.\nAre you sure you want to delete the CONSUMER?",
			})) return

			mcpServerSo.delete(id)

			store.state.group.addLink({ view: null, parent: store, anim: true })

			store.setSnackbar({
				open: true, type: MESSAGE_TYPE.SUCCESS, timeout: 5000,
				title: "DELETED",
				body: "it is gone forever",
			})
		},

	},

	mutators: {
		setAll: (all: McpServer[]) => ({ all }),
	},
}

export type McpServerListState = typeof setup.state & ViewState
export type McpServerListGetters = typeof setup.getters
export type McpServerListActions = typeof setup.actions
export type McpServerListMutators = typeof setup.mutators
export interface McpServerListStore extends LoadBaseStore, ViewStore, McpServerListGetters, McpServerListActions, McpServerListMutators {
	state: McpServerListState
}
const mcpServerListSetup = mixStores(viewSetup, loadBaseSetup, setup)
export default mcpServerListSetup

