import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { EDIT_STATE } from "@/types/index.js"
import { focusSo, MESSAGE_TYPE, VIEW_SIZE } from "@priolo/jack"
import { mixStores } from "@priolo/jon"
import { AgentDetailStore } from "./detail.js"
import { buildAgentDetail, buildAgentDetailNew } from "./factory.js"
import agentSo from "./repo.js"



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

		/** restituisce l'id del dettaglio selezionato nella lista */
		getSelected: (_: void, store?: AgentListStore): string => {
			return (store.state.linked as AgentDetailStore)?.state?.agentId
		},
		isNewOpen: (_: void, store?: AgentListStore): boolean => {
			return (store.state.linked as AgentDetailStore)?.state?.editState == EDIT_STATE.NEW
		},
	},

	actions: {

		/** apro/chiudo la CARD del dettaglio */
		detail(agentId: string, store?: AgentListStore) {
			const oldId = (store.state.linked as AgentDetailStore)?.state?.agent?.id
			const newId = (agentId && oldId !== agentId) ? agentId : null
			const view = newId ? buildAgentDetail({ agentId }) : null
			store.state.group.addLink({ view, parent: store, anim: !oldId || !newId })
		},

		/** apro il dettaglio in modalità "crea nuovo" */
		create(_: void, store?: AgentListStore) {
			const view = buildAgentDetailNew()
			store.state.group.addLink({ view, parent: store, anim: true })
		},

		/** elimino l'elemento selezionato (se c'e') */
		async delete(_: void, store?: AgentListStore) {
			const agentId = store.getSelected()
			if (!agentId) return

			if (!await store.alertOpen({
				title: "AGENT DELETION",
				body: "This action is irreversible.\nAre you sure you want to delete the AGENT?",
			})) return

			await agentSo.delete(agentId)
			store.state.group.addLink({ view: null, parent: store, anim: true })

			store.setSnackbar({
				open: true, type: MESSAGE_TYPE.SUCCESS, timeout: 5000,
				title: "DELETED",
				body: "it is gone forever",
			})
		},

	},

	mutators: {
	},
}

export type AgentListState = typeof setup.state & ViewState
export type AgentListGetters = typeof setup.getters
export type AgentListActions = typeof setup.actions
export type AgentListMutators = typeof setup.mutators
export interface AgentListStore extends ViewStore, AgentListGetters, AgentListActions, AgentListMutators {
	state: AgentListState
}
const agentListSetup = mixStores(viewSetup, setup)
export default agentListSetup
