import promptApi from "@/api/prompt"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { EDIT_STATE } from "@/types"
import { Prompt } from "@/types/Prompt"
import { DragDoc, MESSAGE_TYPE } from "@priolo/jack"
import { mixStores } from "@priolo/jon"
import { createEditor } from "slate"
import { withHistory } from 'slate-history'
import { withReact } from "slate-react"
import { EditorState } from "../../editorBase"
import { NodeType, PROMPT_ROLES } from "./slate/types"
import { SugarEditor, withSugar } from "./slate/withSugar"



const setup = {

	state: {

		prompt: <Partial<Prompt>>null,
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
		getTitle: (_: void, store?: ViewStore) => "ROOM",
		getSubTitle: (_: void, store?: ViewStore) => "room detail",
		//#endregion
	},

	actions: {

		//#region VIEWBASE

		onDrop: (data: DragDoc, store?: ViewStore) => {
			const editorSo = store as RoomDetailStore
			const editor = editorSo.state.editor
			if (!data.source?.view) return

			// se è uno spostamento al'interno dello stesso documento...
			if (data.source.view == data.destination?.view) {
				editor.moveNodes({ at: [data.source.index], to: [data.destination.index] })

				// si trata di uno spostamento da CARD esterna
			} else {
				// è un NODE di una CARD esterna
				if (data.source.index) {
					const sourceEditor = (<RoomDetailStore>data.source.view).state.editor
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
			const editorSo = store as RoomDetailStore

			// creo l'editor SLATE
			const editor: SugarEditor = withSugar(withHistory(withReact(createEditor())))
			editor.store = editorSo
			//editor.children = editorSo.state.initValue ?? [{ type: PROMPT_TYPES.SYSTEM, children: [{ text: "" }] }] as NodeType[]
			editorSo.state.editor = editor
		},

		//#endregion

		async fetch(_: void, store?: RoomDetailStore) {
			if (!store.state.prompt?.id) return
			const prompt = await promptApi.get(store.state.prompt.id, { store, manageAbort: true })
			store.setPrompt(prompt)
		},

		async fetchIfVoid(_: void, store?: RoomDetailStore) {
			if (!!store.state.prompt?.name) return 
			await store.fetch()
		},

		async save(_: void, store?: RoomDetailStore) {
			let promptSaved: Prompt = null
			if (store.state.editState == EDIT_STATE.NEW) {
				promptSaved = await promptApi.create(store.state.prompt, { store })
			} else {
				promptSaved = await promptApi.update(store.state.prompt, { store })
			}
			store.setPrompt(promptSaved)
			store.setEditState(EDIT_STATE.READ)
			store.setSnackbar({
				open: true, type: MESSAGE_TYPE.SUCCESS, timeout: 5000,
				title: "SAVED",
				body: "Prompt saved successfully",
			})
		},

		restore: (_: void, store?: RoomDetailStore) => {
			store.fetch()
			store.setEditState(EDIT_STATE.READ)
		},

		execute: async (_: void, store?: RoomDetailStore) => {
			const prompt = await promptApi.execute(store.state.prompt, { store, manageAbort: true })
			store.setPrompt(prompt)
		},

	},

	mutators: {
		setPrompt: (prompt: Partial<Prompt>) => ({ prompt }),
		setEditState: (editState: EDIT_STATE) => ({ editState }),
		setRoleDialogOpen: (roleDialogOpen: boolean) => ({ roleDialogOpen }),
		setToolsDialogOpen: (toolsDialogOpen: boolean) => ({ toolsDialogOpen }),
		setLlmDialogOpen: (llmDialogOpen: boolean) => ({ llmDialogOpen }),
	},
}

export type RoomDetailState = typeof setup.state & ViewState & EditorState
export type RoomDetailGetters = typeof setup.getters
export type RoomDetailActions = typeof setup.actions
export type RoomDetailMutators = typeof setup.mutators
export interface RoomDetailStore extends ViewStore, RoomDetailGetters, RoomDetailActions, RoomDetailMutators {
	state: RoomDetailState
	onCreated: (_: void, store?: ViewStore) => Promise<void>;
}
const roomDetailSetup = mixStores(viewSetup, setup)
export default roomDetailSetup
