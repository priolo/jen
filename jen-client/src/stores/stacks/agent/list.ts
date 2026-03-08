import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { EDIT_STATE } from "@/types/index.js"
import { MESSAGE_TYPE } from "@priolo/jack"
import { mixStores } from "@priolo/jon"
import { AgentDetailStore } from "./detail.js"
import { buildAgentDetail, buildAgentDetailNew, buildAgentList } from "./factory.js"
import agentSo from "./repo.js"
import { AgentDTO } from "@shared/types/AgentDTO.js"



const setup = {

	state: {
		//#region VIEWBASE
		width: 270,
		widthMax: 1000,
		noSerialization: false,
		//#endregion


		// *********************************

		/** ITEMs da visualizzare. Se null, visualizzo tutti gli ITEMs disponibili */
		items: <AgentDTO[]>null,
		textSearch: "",
		editState: EDIT_STATE.READ,
		/** callback chiamato quando seleziono un item */
		onSelected: <(view: AgentListStore, item: AgentDTO) => void>null,
		onItemsChange: <(view: AgentListStore, items: AgentDTO[]) => void>null,

		// *********************************

	},

	getters: {

		//#region VIEWBASE

		getTitle: (_: void, store?: ViewStore) => "AGENT",
		getSubTitle: (_: void, store?: ViewStore) => "agent list",
		getSerialization: (_: void, store?: ViewStore) => {
			const s = store as AgentListStore
			if ( !!s.state.noSerialization ) return null
			return viewSetup.getters.getSerialization(null, store)
		},

		//#endregion


		// *********************************

		/** restituisce l'id del dettaglio selezionato nella lista */
		getSelected: (_: void, store?: AgentListStore): string => {
			return (store.state.linked as AgentDetailStore)?.state?.agentId
		},
		isNewOpen: (_: void, store?: AgentListStore): boolean => {
			return (store.state.linked as AgentDetailStore)?.state?.editState == EDIT_STATE.NEW
		},
		isAddSelected: (_: void, store?: AgentListStore): boolean => {
			return !!(store.state.linked as AgentListStore)?.state?.onSelected
		},
		/** restituisce la lista dei tool da visualizzare, filtrata con textSearch */
		getList: (_: void, store?: AgentListStore): AgentDTO[] => {
			const textSearch = store.state.textSearch?.toLowerCase() ?? ""
			const all = store.state.items ?? agentSo.state.all ?? []
			if (!store.state.textSearch) return all
			return all
				.filter(tool => tool.name.toLowerCase().includes(textSearch))
		},
		/**
		 * Se c'e' la lista dei TOOLS del proprio parent
		 * Servbe per vedere i "disabled" nella lista totale, per evitare di aggiungere doppioni
		 */
		getParentList: (_: void, store?: AgentListStore): AgentDTO[] => {
			return (<AgentListStore>store.state.parent)?.state.items
		}

		// *********************************
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

		// *********************************

		remove(_: void, store?: AgentListStore) {
			const itemId = store.getSelected()
			if (!itemId) return
			store.state.onItemsChange(
				store,
				store.state.items?.filter(t => t.id != itemId)
			)
		},

		/** eseguo il select sull'eventuale parent */
		select(_: void, store?: AgentListStore) {
			const selectedId = store.getSelected()
			if (!selectedId || !store.state.onSelected) return
			const tool = agentSo.state.all.find(t => t.id == selectedId)
			store.state.onSelected(store, tool)
			//store.onRemoveFromDeck()
		},

		add(_: void, store?: AgentListStore) {
			const view = !store.isAddSelected()
				? buildAgentList({
					editState: EDIT_STATE.EDIT,
					onSelected: (view, tool) => {
						store.state.onItemsChange(store, [...store.state.items, tool])
					}
				})
				: null
			store.state.group.addLink({ view, parent: store, anim: true })
		},

		// *********************************

	},

	mutators: {
		setTextSearch: (textSearch: string) => ({ textSearch }),
		setItems: (items: AgentDTO[]) => ({ items }),
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
