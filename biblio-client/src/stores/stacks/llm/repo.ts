import llmApi from "@/api/llm"
import { Llm } from "@/types/Llm"
import { createStore, StoreCore } from "@priolo/jon"



const setup = {

	state: {
		all: <Llm[]>null,
	},

	getters: {
		getIndexById(id: string, store?: LlmStore) {
			if (!id) return -1
			return store.state.all?.findIndex(llm => llm.id == id)
		},
	},

	actions: {

		//#region VIEWBASE

		//#endregion

		//#region OVERWRITE
		async fetch(_: void, store?: LlmStore) {
			//const s = <LlmStore>store
			// const cnnStore = utils.findAll(docsSo.getAllCards(), { type: DOC_TYPE.CONNECTIONS })?.[0]
			// socketPool.closeAll()
			const llm = await llmApi.index({ store })
			store.setAll(llm)
			//await loadBaseSetup.actions.fetch(_, store)
		},
		//#endregion

		async fetchIfVoid(_: void, store?: LlmStore) {
			if (!!store.state.all) return
			await store.fetch()
		},


		async save(llm: Partial<Llm>, store?: LlmStore): Promise<Llm> {
			let llmSaved: Llm = null
			if (!llm.id) {
				llmSaved = await llmApi.create(llm, { store })
			} else {
				llmSaved = await llmApi.update(llm as Llm, { store })
			}

			const all = [...store.state.all]
			const index = store.getIndexById(llm?.id)
			index == -1 ? all.push(llmSaved) : (all[index] = { ...all[index], ...llmSaved })
			store.setAll(all)

			return llmSaved
		},

		async delete(llmId: string, store?: LlmStore) {
			await llmApi.remove(llmId, { store })
			store.setAll(store.state.all.filter(llm => llm.id != llmId))
		},

	},

	mutators: {
		setAll: (all: Llm[]) => ({ all }),
	},
}

export type LlmState = typeof setup.state
export type LlmGetters = typeof setup.getters
export type LlmActions = typeof setup.actions
export type LlmMutators = typeof setup.mutators
export interface LlmStore extends StoreCore<LlmState>, LlmGetters, LlmActions, LlmMutators {
	state: LlmState
}

const llmSo = createStore<LlmState>(setup)
export default llmSo as LlmStore