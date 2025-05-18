import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { DragDoc } from "@priolo/jack"
import { mixStores } from "@priolo/jon"
import { createEditor } from "slate"
import { withHistory } from 'slate-history'
import { withReact } from "slate-react"
import { EditorState } from "../editorBase"
import { NodeType, PROMPT_ROLES } from "./slate/types"
import { SugarEditor, withSugar } from "./slate/withSugar"



const setup = {

	state: {
		/** Doc corrente in editor */
		docId: <string>null,
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
		roleDialogOpen: false,

		//#region VIEWBASE
		width: 370,
		widthMax: 1000,
		//#endregion
	},

	getters: {
		//#region VIEWBASE
		getTitle: (_: void, store?: ViewStore) => "NOTE",
		getSubTitle: (_: void, store?: ViewStore) => "Just for an ephemeral note",
		//#endregion
	},

	actions: {

		//#region VIEWBASE

		onDrop: (data: DragDoc, store?: ViewStore) => {
			const editorSo = store as AgentStore
			const editor = editorSo.state.editor
			if (!data.source?.view) return

			// se è uno spostamento al'interno dello stesso documento...
			if (data.source.view == data.destination?.view) {
				editor.moveNodes({ at: [data.source.index], to: [data.destination.index] })

				// si trata di uno spostamento da CARD esterna
			} else {
				// è un NODE di una CARD esterna
				if (data.source.index) {
					const sourceEditor = (<AgentStore>data.source.view).state.editor
					if (!sourceEditor) return
					const [node] = sourceEditor.node([data.source.index])
					editor.insertNode(node, { at: [data.destination.index] })
					// è tutta la CARD
				} else {
					// cotruisco un NODE da una VIEW
					const node = {
						type: PROMPT_ROLES.CARD,
						data: data.source.view.getSerialization(),
						subtitle: data.source.view.getSubTitle(),
						children: [{ text: data.source.view.getTitle() }],
					}
					editor.insertNode(node, { at: [data.destination.index] })
				}
			}
		},

		/** chiamata dalla build dello stesso store */
		onCreated: async (_: void, store?: ViewStore) => {
			const editorSo = store as AgentStore

			// creo l'editor SLATE
			const editor: SugarEditor = withSugar(withHistory(withReact(createEditor())))
			editor.store = editorSo
			//editor.children = editorSo.state.initValue ?? [{ type: PROMPT_TYPES.SYSTEM, children: [{ text: "" }] }] as NodeType[]
			editorSo.state.editor = editor
		},

		//#endregion

	},

	mutators: {
		setRoleDialogOpen: (roleDialogOpen:boolean ) => ({ roleDialogOpen }),
	},
}

export type AgentState = typeof setup.state & ViewState & EditorState
export type AgentGetters = typeof setup.getters
export type AgentActions = typeof setup.actions
export type AgentMutators = typeof setup.mutators
export interface AgentStore extends ViewStore, AgentGetters, AgentActions, AgentMutators {
	state: AgentState
	onCreated: (_: void, store?: ViewStore) => Promise<void>;
}
const agentSetup = mixStores(viewSetup, setup)
export default agentSetup
