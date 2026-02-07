import agentSo from "@/stores/stacks/agent/repo.js"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE } from "@/types/index.js"
import { focusSo, loadBaseSetup, LoadBaseStore, MESSAGE_TYPE, VIEW_SIZE } from "@priolo/jack"
import { mixStores } from "@priolo/jon"
import { RoomDetailStore } from "./detail.js"
import { AgentDetailStore } from "../../agent/detail.js"
import { buildAgentDetail, buildAgentDetailNew } from "../../agent/factory.js"
import agentApi from "@/api/agent.js"
import roomApi from "@/api/room.js"
import { AgentDTO } from "@shared/types/AgentDTO.js"
import { add } from "@priolo/jon-utils/dist/object/diff.js"
import chatRepoSo from "../../chat/repo.js"
import { JsonCommand, TYPE_JSON_COMMAND } from "@shared/update.js"
import chatWSSo from "../../chat/ws.js"



const setup = {

	state: {
		//#region VIEWBASE
		width: 370,
		widthMax: 1000,
		//#endregion

		roomId: <string>null,
		agents: <AgentDTO[]>null,
	},

	getters: {
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "AGENT",
		getSubTitle: (_: void, store?: ViewStore) => "agent list",
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as RoomAgentsListState
			return {
				...viewSetup.getters.getSerialization(null, store),
				roomId: state.roomId,
			}
		},
		//#endregion

		getSelectableAgents: (_: void, store?: RoomAgentsListStore) => {
			const roomAgentsIds = store.state.agents?.map(a => a.id) ?? []
			return agentSo.state.all?.filter(agent => !roomAgentsIds.includes(agent.id)) ?? []
		}
	},

	actions: {

		//#region OVERRIDE VIEWBASE
		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as RoomAgentsListState
			state.roomId = data.roomId
		},
		//#endregion



		//#region OVERRIDE LOADBASE
		
		/**
		 * inizializzo la lista con gli AGENTI della ROOM
		 */
		async fetch(_: void, store?: LoadBaseStore) {
			const agentsSo = store as RoomAgentsListStore
			const agents = await roomApi.getAgents(agentsSo.state.roomId, { store })
			agentsSo.setAgents(agents)
		},

		async fetchIfVoid(_: void, store?: RoomAgentsListStore) {
			if (!!store.state.agents) return
			await store.fetch()
		},

		//#endregion

		/**
		 * Aggiunge un AGENTE alla ROOM
		 */
		addAgent(agent: AgentDTO, store?: RoomAgentsListStore) {
			const cmm:JsonCommand = {
				type: TYPE_JSON_COMMAND.MERGE,
				path: `rooms.{id:${store.state.roomId}}.agentsIds`,
				value: agent.id,
			}
			const chat = chatRepoSo.getByRoomId(store.state.roomId)
			chatWSSo.updateChat({
				chatId: chat.id,
				commands: [ cmm ],
			})

			// const room = chatRepoSo.getRoomById(store.state.roomId)
			// const agentsSo = store as RoomAgentsListStore
			// const roomId = agentsSo.state.roomId
			// roomApi.addAgent(roomId, agent.id, { store }).then(() => {
			// 	agentsSo.setAgents([ ...(agentsSo.state.agents ?? []), agent ])
			// })
		},
		removeAgent(agent: AgentDTO, store?: RoomAgentsListStore) {
			const cmm:JsonCommand = {
				type: TYPE_JSON_COMMAND.DELETE,
				path: `rooms.{id:${store.state.roomId}}.agentsIds`,
				value: agent.id,
			}
			const chat = chatRepoSo.getByRoomId(store.state.roomId)
			chatWSSo.updateChat({
				chatId: chat.id,
				commands: [ cmm ],
			})
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
		setAgents: (agents: AgentDTO[]) => ({ agents }),
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
