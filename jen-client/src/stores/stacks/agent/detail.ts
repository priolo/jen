import agentApi from "@/api/agent"
import { deckCardsSo } from "@/stores/docs/cards"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { DOC_TYPE, EDIT_STATE } from "@/types"
import { MESSAGE_TYPE } from "@priolo/jack"
import { mixStores } from "@priolo/jon"
import { AgentDTO } from "@shared/types/AgentDTO"
import { ToolDTO } from "@shared/types/ToolDTO"
import { buildEditorFromAgent } from "../agentEditor/factory"
import { EditorState } from "../editorBase"
import { buildLlmDetail, buildLlmList } from "../llm/factory"
import { LlmListStore } from "../llm/list"
import { buildRoomDetail } from "../room/factory"
import { buildToolList } from "../tool/factory"
import toolSo from "../tool/repo"
import { buildAgentList } from "./factory"
import agentSo from "./repo"



const setup = {

	state: {

		/** id dell'agente */
		agentId: <string>null,
		agent: <Partial<AgentDTO>>null,
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
		getSerialization: (_: void, store?: ViewStore) => {
			const state = store.state as AgentDetailState
			return {
				...viewSetup.getters.getSerialization(null, store),
				agentId: state.agentId,
			}
		},

		//#endregion

		getTools: (_: void, store?: AgentDetailStore): ToolDTO[] => {
			return (store.state.agent?.toolsIds ?? [])
				.map(id => toolSo.getById(id))
		},
		getSubAgents: (_: void, store?: AgentDetailStore): AgentDTO[] => {
			return (store.state.agent?.subAgentsIds ?? [])
				.map(id => agentSo.getById(id))
		},

	},

	actions: {

		//#region VIEWBASE

		setSerialization: (data: any, store?: ViewStore) => {
			viewSetup.actions.setSerialization(data, store)
			const state = store.state as AgentDetailState
			state.agentId = data.agentId
		},

		//#endregion

		/**
		 * Carica il dettaglio di questo AGENT
		 */
		async fetch(_: void, store?: AgentDetailStore) {
			if (!store.state.agentId || store.state.editState == EDIT_STATE.NEW) return
			const agent = (await agentApi.get(store.state.agentId, { store, manageAbort: true }))?.agent
			store.setAgent(agent)
		},
		async fetchIfVoid(_: void, store?: AgentDetailStore) {
			if (!!store.state.agent) return
			await store.fetch()
		},

		/**
		 * Salva o aggiorna un AGENT
		 */
		async save(_: void, store?: AgentDetailStore) {
			// let agentSaved: Agent = null
			// if (store.state.editState == EDIT_STATE.NEW) {
			// 	agentSaved = await agentApi.create(store.state.agent, { store })
			// } else {
			// 	agentSaved = await agentApi.update(store.state.agent, { store })
			// }
			const agentSaved = await agentSo.save(store.state.agent)
			store.state.agentId = agentSaved.id
			store.setAgent(agentSaved)
			store.setEditState(EDIT_STATE.READ)
			store.setSnackbar({
				open: true, type: MESSAGE_TYPE.SUCCESS, timeout: 5000,
				title: "SAVED",
				body: "Agent saved successfully",
			})
		},

		/**
		 * ripristina il valore originale (prima della modifica)
		 * cioe' quello delle API
		 */
		restore: (_: void, store?: AgentDetailStore) => {
			store.fetch()
			store.setEditState(EDIT_STATE.READ)
		},



		/** apertura della CARD ROOM */
		openChatRoom(_: void, store?: AgentDetailStore) {
			//chatSo.createChat(store.state.agent?.id)
			const view = buildRoomDetail({
				agentsIds: [store.state.agent?.id],
			})
			deckCardsSo.add({ view, anim: true })
		},

		/** apertura della CARD EDITOR */
		openEditor(_: void, store?: AgentDetailStore) {
			const view = buildEditorFromAgent(store.state.agent?.id)
			store.state.group.addLink({ view, parent: store, anim: true })
		},

		async openLlmCard(_: void, store?: AgentDetailStore) {
			const linked = store.state.linked

			if (store.state.editState == EDIT_STATE.READ) {
				if (linked?.state.type == DOC_TYPE.LLM_DETAIL && (linked as any)?.state?.llmId == store.state.agent.llmId) {
					store.state.linked.onRemoveFromDeck()
					return
				}
				const llmId = store.state.agent.llmId
				const view = buildLlmDetail({ llmId })
				store.state.group.addLink({ view, parent: store, anim: true })
				
			} else {
				if (linked?.state.type == DOC_TYPE.LLM_LIST) {
					linked.onRemoveFromDeck()
					return
				}
				const view = buildLlmList({
					onSelected: (view, llm) => {
						store.setAgent({ ...store.state.agent, llmId: llm.id })
					}
				})
				await store.state.group.addLink({ view, parent: store, anim: true })
				if (!store.state.agent.llmId) return
				const viewDetail = buildLlmDetail({ llmId: store.state.agent.llmId })
				store.state.group.addLink({ view: viewDetail, parent: view, anim: true })
			}
		},

		/** apre la lista dei TOOLS */
		async openToolsCard(_: void, store?: AgentDetailStore) {
			// temporaneamente costruisco io gli LLM
			const toolsIds = store.state.agent?.toolsIds ?? []
			const tools = toolSo.state.all.filter(item => toolsIds.includes(item.id))

			const view = buildToolList({
				items: tools,
				editState: store.state.editState,
				onItemsChange: (view, items) => {
					store.setAgent({ ...store.state.agent, toolsIds: items.map(t => t.id) })
					view.setItems(items)
				},
			})
			store.state.group.addLink({ view, parent: store, anim: true })
		},

		/** apre la lista dei TOOLS */
		async openSubAgentsCard(_: void, store?: AgentDetailStore) {
			// temporaneamente costruisco io gli LLM
			const subAgentsIds = store.state.agent?.subAgentsIds ?? []
			const subAgents = agentSo.state.all.filter(item => subAgentsIds.includes(item.id))

			const view = buildAgentList({
				items: subAgents,
				editState: store.state.editState,
				onItemsChange: (view, items) => {
					store.setAgent({ ...store.state.agent, subAgentsIds: items.map(t => t.id) })
					view.setItems(items)
				}
			})
			store.state.group.addLink({ view, parent: store, anim: true })
		},

		// ---------

		onSelect(view: ViewStore, store?: AgentDetailStore) {
			const llmId = (<LlmListStore>view)?.getSelected()
			console.log("SELECTED", llmId)
			store.setAgent({ ...store.state.agent, llmId })
		},

	},

	mutators: {
		setAgent: (agent: Partial<AgentDTO>) => ({ agent }),
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
