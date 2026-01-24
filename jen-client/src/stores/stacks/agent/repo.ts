import agentApi from "@/api/agent"
import { AgentLlm } from "@/types/Agent"
import { createStore, StoreCore } from "@priolo/jon"



const setup = {

	state: {
		all: <AgentLlm[]>null,
	},

	getters: {
		getIndexById(id: string, store?: AgentStore) {
			if (!id) return -1
			return store.state.all?.findIndex(llm => llm.id == id)
		},
		getById(id: string, store?: AgentStore): AgentLlm {
			if (!id) return null
			return store.state.all?.find(llm => llm.id == id) ?? null
		},
		/**
		 * Restituisce tutti i parent di "agentId" fino al primo agente base.
		 */
		getAllBaseAgents(agentId: string, store?: AgentStore): AgentLlm[] {
			let nextAgent = store.getById(agentId)
			const agents:AgentLlm[] = []
			do {
				nextAgent = store.getById(nextAgent?.baseId)
				if (!nextAgent) break
				agents.push(nextAgent)
			} while (true)
			return agents
		}
	},

	actions: {

		async fetch(_: void, store?: AgentStore) {
			const agents = await agentApi.index({ store })
			store.setAll(agents)
			//await loadBaseSetup.actions.fetch(_, store)
		},

		async save(agent: Partial<AgentLlm>, store?: AgentStore): Promise<AgentLlm> {
			let agentSaved: AgentLlm = null
			if (!agent.id) {
				agentSaved = await agentApi.create(agent, { store })
			} else {
				agentSaved = await agentApi.update(agent as AgentLlm, { store })
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
		setAll: (all: AgentLlm[]) => ({ all }),
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