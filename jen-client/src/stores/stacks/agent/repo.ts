import agentApi from "@/api/agent"
import { createStore, StoreCore } from "@priolo/jon"
import { AgentDTO } from "@shared/types/AgentDTO"



const setup = {

	state: {
		all: <AgentDTO[]>null,
	},

	getters: {
		getIndexById(id: string, store?: AgentStore) {
			if (!id) return -1
			return store.state.all?.findIndex(llm => llm.id == id)
		},
		getById(id: string, store?: AgentStore): AgentDTO {
			if (!id) return null
			return store.state.all?.find(llm => llm.id == id) ?? null
		},
		/**
		 * Restituisce tutti i parent di "agentId" fino al primo agente base.
		 */
		getAllBaseAgents(agentId: string, store?: AgentStore): AgentDTO[] {
			let nextAgent = store.getById(agentId)
			const agents:AgentDTO[] = []
			do {
				nextAgent = store.getById(nextAgent?.baseId)
				if (!nextAgent) break
				agents.push(nextAgent)
			} while (true)
			return agents
		}
	},

	actions: {

		/** carico tutti gli AGENT appartenenti a me */
		async fetch(_: void, store?: AgentStore) {
			const agents = await agentApi.index({ store })
			store.setAll(agents)
			//await loadBaseSetup.actions.fetch(_, store)
		},

		
		async save(agent: Partial<AgentDTO>, store?: AgentStore): Promise<AgentDTO> {
			let agentSaved: AgentDTO = null
			if (!agent.id) {
				agentSaved = await agentApi.create(agent, { store })
			} else {
				agentSaved = await agentApi.update(agent as AgentDTO, { store })
			}

			const all = [...store.state.all]
			const index = store.getIndexById(agent?.id)
			index == -1 ? all.push(agentSaved) : (all[index] = { ...all[index], ...agentSaved })
			store.setAll(all)

			return agentSaved
		},

		async delete(agentId: string, store?: AgentStore) {
			await agentApi.remove(agentId, { store })
			store.setAll(store.state.all.filter(agent => agent.id != agentId))
		},

	},

	mutators: {
		setAll: (all: AgentDTO[]) => ({ all }),
	},
}

export type AgentState = typeof setup.state
export type AgentGetters = typeof setup.getters
export type AgentActions = typeof setup.actions
export type AgentMutators = typeof setup.mutators
export interface AgentStore extends StoreCore<AgentState>, AgentGetters, AgentActions, AgentMutators {
	state: AgentState
}

const agentSo = createStore<AgentState>(setup)
export default agentSo as AgentStore