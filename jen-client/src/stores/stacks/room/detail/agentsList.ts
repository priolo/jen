import agentSo from "@/stores/stacks/agent/repo.js"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE } from "@/types/index.js"
import { focusSo, loadBaseSetup, LoadBaseStore, MESSAGE_TYPE, VIEW_SIZE } from "@priolo/jack"
import { mixStores } from "@priolo/jon"
import { RoomDetailStore } from "./detail.js"
import { AgentDetailStore } from "../../agent/detail.js"
import { buildAgentDetail, buildAgentDetailNew } from "../../agent/factory.js"



const setup = {

	state: {
		//#region VIEWBASE
		width: 370,
		widthMax: 1000,
		//#endregion

		noSelection: <boolean>false,
		selectedIds: <string[]>[],
	},

	getters: {
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "AGENT",
		getSubTitle: (_: void, store?: ViewStore) => "agent list",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as RoomAgentsListState
			return {
				...viewSetup.getters.getSerialization(null, store),
				selectedIds: state.selectedIds,
			}
		},
		//#endregion

	},

	actions: {

		//#region OVERRIDE VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as RoomAgentsListState
			state.selectedIds = data.selectedIds ?? []
		},
		//#endregion

		//#region OVERRIDE LOADBASE


		//#endregion

		/**
		 * inizializzo la lista con gli AGENTI della ROOM
		 */
		init(_: void, store?: RoomAgentsListStore) {
			let selectedIds: string[] = []
			const parent = store.state.parent as RoomDetailStore
			if (!!parent && parent.state.type == DOC_TYPE.ROOM_DETAIL) {
				selectedIds = parent.getRoom()?.agentsIds ?? []
			}
			store.setSelectedIds(selectedIds)
		},

		/** apro/chiudo la CARD del dettaglio */
		openDetail(agentId: string, store?: RoomAgentsListStore) {
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

		/** 
		 * Apre la CARD per la creazione di un nuovo AGENTE
		 * */
		create(_: void, store?: RoomAgentsListStore) {
			const view = buildAgentDetailNew()
			store.state.group.addLink({ view, parent: store, anim: true })
		},

		/**
		 * Elimina un AGENTE
		 */
		async delete(agentId: string, store?: RoomAgentsListStore) {
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
		setSelectedIds: (selectedIds: string[]) => ({ selectedIds }),
	},
}

export type RoomAgentsListState = typeof setup.state & ViewState
export type RoomAgentsListGetters = typeof setup.getters
export type RoomAgentsListActions = typeof setup.actions
export type RoomAgentsListMutators = typeof setup.mutators
export interface RoomAgentsListStore extends LoadBaseStore, ViewStore, RoomAgentsListGetters, RoomAgentsListActions, RoomAgentsListMutators {
	state: RoomAgentsListState
}
const roomAgentsListSetup = mixStores(viewSetup, loadBaseSetup, setup)
export default roomAgentsListSetup
