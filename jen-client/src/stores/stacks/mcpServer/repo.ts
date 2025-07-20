import mcpServerApi from "@/api/mcpServer"
import { McpServer } from "@/types/McpServer"
import { createStore, StoreCore } from "@priolo/jon"



const setup = {

	state: {
		all: <McpServer[]>null,
	},

	getters: {
		getIndexById(id: string, store?: McpServerStore) {
			if (!id) return -1
			return store.state.all?.findIndex(llm => llm.id == id)
		},
	},

	actions: {

		//#region VIEWBASE

		//#endregion

		//#region OVERWRITE
		async fetch(_: void, store?: McpServerStore) {
			//const s = <LlmStore>store
			// const cnnStore = utils.findAll(docsSo.getAllCards(), { type: DOC_TYPE.CONNECTIONS })?.[0]
			// socketPool.closeAll()
			const mcpServers = await mcpServerApi.index({ store })
			store.setAll(mcpServers)
			//await loadBaseSetup.actions.fetch(_, store)
		},
		//#endregion

		async fetchIfVoid(_: void, store?: McpServerStore) {
			if (!!store.state.all) return
			await store.fetch()
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
			store.setAll(store.state.all.filter(llm => llm.id != id))
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