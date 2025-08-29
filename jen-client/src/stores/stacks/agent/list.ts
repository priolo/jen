import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { focusSo, loadBaseSetup, LoadBaseStore, MESSAGE_TYPE, VIEW_SIZE } from "@priolo/jack"
import { mixStores } from "@priolo/jon"
import { AgentDetailStore } from "./detail.js"
import { buildAgentDetail, buildAgentDetailNew } from "./factory.js"
import agentSo from "./repo.js"
import { AgentLlm } from "@/types/Agent"



const setup = {

	state: {
		//#region VIEWBASE
		width: 370,
		widthMax: 1000,
		//#endregion
	},

	getters: {
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "AGENT",
		getSubTitle: (_: void, store?: ViewStore) => "agent list",
		//#endregion
	},

	actions: {

		//#region OVERRIDE VIEWBASE
		//#endregion

		//#region OVERRIDE LOADBASE

		async fetch(_: void, store?: LoadBaseStore) {
			await agentSo.fetch()
		},

		//#endregion

		/** apro/chiudo la CARD del dettaglio */
		select(agentId: string, store?: AgentListStore) {
			const detached = focusSo.state.shiftKey
			const oldId = (store.state.linked as AgentDetailStore)?.state?.agent?.id
			const newId = (agentId && oldId !== agentId) ? agentId : null

			if (detached) {
				const view = buildAgentDetail({ agent: { id: agentId }, size: VIEW_SIZE.NORMAL })
				store.state.group.add({ view, index: store.state.group.getIndexByView(store) + 1 })
			} else {
				const view = newId ? buildAgentDetail({ agent: { id: agentId } }) : null
				//store.setSelect(newId)
				store.state.group.addLink({ view, parent: store, anim: !oldId || !newId })
			}
		},

		create(_: void, store?: AgentListStore) {
			const view = buildAgentDetailNew()
			store.state.group.addLink({ view, parent: store, anim: true })
		},

		async delete(agentId: string, store?: AgentListStore) {
			if (!await store.alertOpen({
				title: "AGENT DELETION",
				body: "This action is irreversible.\nAre you sure you want to delete the AGENT?",
			})) return

			agentSo.delete(agentId)

			store.state.group.addLink({ view: null, parent: store, anim: true })

			store.setSnackbar({
				open: true, type: MESSAGE_TYPE.SUCCESS, timeout: 5000,
				title: "DELETED",
				body: "it is gone forever",
			})
		},

	},

	mutators: {
		setAll: (all: AgentLlm[]) => ({ all }),
	},
}

export type AgentListState = typeof setup.state & ViewState
export type AgentListGetters = typeof setup.getters
export type AgentListActions = typeof setup.actions
export type AgentListMutators = typeof setup.mutators
export interface AgentListStore extends LoadBaseStore, ViewStore, AgentListGetters, AgentListActions, AgentListMutators {
	state: AgentListState
}
const agentListSetup = mixStores(viewSetup, loadBaseSetup, setup)
export default agentListSetup
