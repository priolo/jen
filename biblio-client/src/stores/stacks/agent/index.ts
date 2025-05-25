import agentApi from "@/api/agent"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { EDIT_STATE } from "@/types"
import { Agent } from "@/types/Agent"
import { MESSAGE_TYPE } from "@priolo/jack"
import { mixStores } from "@priolo/jon"
import { EditorState } from "../editorBase"



const setup = {

	state: {

		agent: <Agent>null,
		editState: EDIT_STATE.READ,

		/** indica che la dialog TOOLS è aperto */
		toolsDialogOpen: false,
		/** indica che la dialog LLM è aperto */
		llmDialogOpen: false,

		//#region VIEWBASE
		width: 370,
		widthMax: 1000,
		//#endregion
	},

	getters: {
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "AGENT",
		getSubTitle: (_: void, store?: ViewStore) => "agente",
		//#endregion
	},

	actions: {

		//#region VIEWBASE
		//#endregion

		async fetch(_: void, store?: AgentDetailStore) {
			if (!store.state.agent?.id) return
			const agent = await agentApi.get(store.state.agent.id, { store, manageAbort: true })
			store.setAgent(agent)
		},

		async fetchIfVoid(_: void, store?: AgentDetailStore) {
			if (!!store.state.agent?.name) return // Assuming name is a required prop
			await store.fetch()
		},

		async save(_: void, store?: AgentDetailStore) {
			let agentSaved: Agent = null
			if (store.state.editState == EDIT_STATE.NEW) {
				agentSaved = await agentApi.create(store.state.agent, { store })
			} else {
				agentSaved = await agentApi.update(store.state.agent, { store })
			}
			store.setAgent(agentSaved)
			store.setEditState(EDIT_STATE.READ)
			store.setSnackbar({
				open: true, type: MESSAGE_TYPE.SUCCESS, timeout: 5000,
				title: "SAVED",
				body: "Agent saved successfully",
			})
		},

		restore: (_: void, store?: AgentDetailStore) => {
			store.fetch()
			store.setEditState(EDIT_STATE.READ)
		},

	},

	mutators: {
		setAgent: (agent: Agent) => ({ agent }),
		setEditState: (editState: EDIT_STATE) => ({ editState }),
		setToolsDialogOpen: (toolsDialogOpen: boolean) => ({ toolsDialogOpen }),
		setLlmDialogOpen: (llmDialogOpen: boolean) => ({ llmDialogOpen }),
	},
}

export type AgentDetailState = typeof setup.state & ViewState & EditorState
export type AgentDetailGetters = typeof setup.getters
export type AgentDetailActions = typeof setup.actions
export type AgentDetailMutators = typeof setup.mutators
export interface AgentDetailStore extends ViewStore, AgentDetailGetters, AgentDetailActions, AgentDetailMutators {
	state: AgentDetailState
	onCreated: (_: void, store?: ViewStore) => Promise<void>;
}
const agentDetailSetup = mixStores(viewSetup, setup)
export default agentDetailSetup
