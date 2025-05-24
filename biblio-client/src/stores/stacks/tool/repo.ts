import toolApi from "@/api/tool"
import { Tool } from "@/types/Tool"
import { createStore, StoreCore } from "@priolo/jon"



const setup = {

	state: {
		all: <Tool[]>null,
	},

	getters: {
		getIndexById(id: string, store?: ToolStore) {
			if (!id) return -1
			return store.state.all?.findIndex(tool => tool.id == id)
		},
	},

	actions: {

		//#region VIEWBASE

		//#endregion

		//#region OVERWRITE

		async fetch(_: void, store?: ToolStore) {
			const tools = await toolApi.index({ store })
			store.setAll(tools)
		},

		//#endregion

		async fetchIfVoid(_: void, store?: ToolStore) {
			if (!!store.state.all) return
			await store.fetch()
		},

		async save(tool: Partial<Tool>, store?: ToolStore): Promise<Tool> {
			let toolSaved: Tool = null
			if (!tool.id) {
				toolSaved = await toolApi.create(tool, { store })
			} else {
				toolSaved = await toolApi.update(tool, { store })
			}

			const all = [...store.state.all]
			const index = store.getIndexById(tool?.id)
			index == -1 ? all.push(toolSaved) : (all[index] = { ...all[index], ...toolSaved })
			store.setAll(all)

			return toolSaved
		},

		async delete(toolId: string, store?: ToolStore) {
			await toolApi.remove(toolId, { store })
			store.setAll(store.state.all.filter(tool => tool.id != toolId))
		},

	},

	mutators: {
		setAll: (all: Tool[]) => ({ all }),
	},
}

export type ToolState = typeof setup.state
export type ToolGetters = typeof setup.getters
export type ToolActions = typeof setup.actions
export type ToolMutators = typeof setup.mutators
export interface ToolStore extends StoreCore<ToolState>, ToolGetters, ToolActions, ToolMutators {
	state: ToolState
}

const toolSo = createStore<ToolState>(setup)
export default toolSo as ToolStore