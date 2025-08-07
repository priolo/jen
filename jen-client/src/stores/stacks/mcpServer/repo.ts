import mcpServerApi from "@/api/mcpServer"
import { McpServer } from "@/types/McpServer"
import { createStore, StoreCore } from "@priolo/jon"



const setup = {

	state: {
		all: <McpServer[]>null,
	},

	getters: {
		getById(id: string, store?: McpServerStore) {
			if (!id) return null
			return store.state.all?.find(mcpServer => mcpServer.id == id)
		},

		getIndexById(id: string, store?: McpServerStore) {
			if (!id) return -1
			return store.state.all?.findIndex(mcpServer => mcpServer.id == id)
		},
	},

	actions: {

		//#region VIEWBASE

		//#endregion

		//#region OVERWRITE

		async fetch(_: void, store?: McpServerStore) {
			const mcpServers = await mcpServerApi.index({ store })
			store.setAll(mcpServers)
		},

		//#endregion

		async fetchIfVoid(_: void, store?: McpServerStore) {
			if (!!store.state.all) return
			await store.fetch()
		},



		/**
		 * Recupero e memorizzo le risorse di un MCP server
		 */
		fetchResources: async (id: string, store?: McpServerStore) => {
			const mcpServer = store.getById(id)
			if (!mcpServer) return
			mcpServer.tools = null
			store._update()
			const resurces = await mcpServerApi.resources(mcpServer.id)
			mcpServer.tools = resurces.tools
			store._update()
		},

		async save(mcpServer: Partial<McpServer>, store?: McpServerStore): Promise<McpServer> {
			let mcpServerSaved: McpServer = null
			if (!mcpServer.id) {
				mcpServerSaved = await mcpServerApi.create(mcpServer, { store })
			} else {
				mcpServerSaved = await mcpServerApi.update(mcpServer, { store })
			}

			const all = [...store.state.all]
			const index = store.getIndexById(mcpServer?.id)
			index == -1 ? all.push(mcpServerSaved) : (all[index] = { ...all[index], ...mcpServerSaved })
			store.setAll(all)

			return mcpServerSaved
		},

		async delete(id: string, store?: McpServerStore) {
			await mcpServerApi.remove(id, { store })
			store.setAll(store.state.all.filter(mcpServer => mcpServer.id != id))
		},

	},

	mutators: {
		setAll: (all: McpServer[]) => ({ all }),
	},
}

export type McpServerState = typeof setup.state
export type McpServerGetters = typeof setup.getters
export type McpServerActions = typeof setup.actions
export type McpServerMutators = typeof setup.mutators
export interface McpServerStore extends StoreCore<McpServerState>, McpServerGetters, McpServerActions, McpServerMutators {
	state: McpServerState
}

const mcpServerSo = createStore<McpServerState>(setup)
export default mcpServerSo as McpServerStore