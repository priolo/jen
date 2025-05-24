import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { DragDoc } from "@priolo/jack"
import { mixStores } from "@priolo/jon"
import { createEditor } from "slate"
import { withHistory } from 'slate-history'
import { withReact } from "slate-react"
import { EditorState } from "../editorBase"
import { NodeType, PROMPT_ROLES } from "./slate/types"
import { SugarEditor, withSugar } from "./slate/withSugar"
import { Agent } from "@/types/Agent"
import { EDIT_STATE } from "@/types"
import agentApi from "@/api/agent"
import { MESSAGE_TYPE } from "@priolo/jack"

const setup = {

	state: {

		agent: <Agent>null,
		editState: EDIT_STATE.READ,

		/** SLATE editor */
		editor: <SugarEditor>null,

		/** testo iniziale */
		initValue: <NodeType[]>[
			{
				type: PROMPT_ROLES.SYSTEM,
				children: [
					{ text: "# primo2" },
					{ text: "\nsecondo **ciccio** 56" },
					{ text: "\nterzo *pippo*" },
				]
			},
			{
				type: PROMPT_ROLES.SYSTEM,
				children: [
					{ text: "# primo2" },
					{ text: "\nsecondo **ciccio** 56" },
					{ text: "\nterzo *pippo*" },
				]
			},
			{
				type: PROMPT_ROLES.SYSTEM,
				children: [
					{ text: "# primo2" },
					{ text: "\nsecondo **ciccio** 56" },
					{ text: "\nterzo *pippo*" },
				]
			}

		],

		/** indica che la dialog ROLE è aperto */
		roleDialogOpen: false,
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

		onDrop: (data: DragDoc, store?: ViewStore) => {
			const editorSo = store as AgentDetailStore
			const editor = editorSo.state.editor
			if (!data.source?.view) return

			// se è uno spostamento al'interno dello stesso documento...
			if (data.source.view == data.destination?.view) {
				editor.moveNodes({ at: [data.source.index], to: [data.destination.index] })

				// si trata di uno spostamento da CARD esterna
			} else {
				// è un NODE di una CARD esterna
				if (data.source.index) {
					const sourceEditor = (<AgentDetailStore>data.source.view).state.editor
					if (!sourceEditor) return
					const [node] = sourceEditor.node([data.source.index])
					editor.insertNode(node, { at: [data.destination.index] })
					// è tutta la CARD
				} else {
					// cotruisco un NODE da una VIEW
					// const node = {
					// 	type: PROMPT_ROLES.CARD, // This was causing an error
					// 	data: data.source.view.getSerialization(),
					// 	subtitle: data.source.view.getSubTitle(),
					// 	children: [{ text: data.source.view.getTitle() }],
					// }
					// editor.insertNode(node, { at: [data.destination.index] })
				}
			}
		},

		/** chiamata dalla build dello stesso store */
		onCreated: async (_: void, store?: ViewStore) => {
			const editorSo = store as AgentDetailStore

			// creo l'editor SLATE
			const editor: SugarEditor = withSugar(withHistory(withReact(createEditor())))
			editor.store = editorSo
			//editor.children = editorSo.state.initValue ?? [{ type: PROMPT_TYPES.SYSTEM, children: [{ text: "" }] }] as NodeType[]
			editorSo.state.editor = editor
		},

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
		setRoleDialogOpen: (roleDialogOpen: boolean) => ({ roleDialogOpen }),
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
