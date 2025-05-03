import { clientObjects } from "@/plugins/docsService"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { DragDoc } from "@priolo/jack"
import { mixStores } from "@priolo/jon"
import { createEditor } from "slate"
import { withHistory } from 'slate-history'
import { withReact } from "slate-react"
import { createUUID } from "../../docs/utils/factory"
import { EditorState } from "../editorBase"
import { NODE_TYPES, NodeType } from "./slate/types"
import { SugarEditor, withSugar } from "./slate/withSugar"
import { updateEditorChildren } from "./utils/slate"
import { SlateApplicator } from "@priolo/jess"



const setup = {

	state: {
		/** Doc corrente in editor */
		docId: <string>null,
		/** SLATE editor */
		editor: <SugarEditor>null,

		/** testo iniziale */
		initValue: <NodeType[]>[{ type: NODE_TYPES.TEXT, children: [{ text: "" }] }],

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
			const editorSo = store as TextEditorStore
			const editor = editorSo.state.editor
			if (!data.source?.view) return

			// se è uno spostamento al'interno dello stesso documento...
			if (data.source.view == data.destination?.view) {
				editor.moveNodes({ at: [data.source.index], to: [data.destination.index] })

				// si trata di uno spostamento da CARD esterna
			} else {
				// è un NODE di una CARD esterna
				if (data.source.index) {
					const sourceEditor = (<TextEditorStore>data.source.view).state.editor
					if (!sourceEditor) return
					const [node] = sourceEditor.node([data.source.index])
					editor.insertNode(node, { at: [data.destination.index] })
					// è tutta la CARD
				} else {
					// cotruisco un NODE da una VIEW
					const node = {
						type: NODE_TYPES.CARD,
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
			const editorSo = store as TextEditorStore

			// creo l'editor SLATE
			const editor: SugarEditor = withSugar(withHistory(withReact(createEditor())))
			editor.store = editorSo
			//editor.children = editorSo.state.initValue ?? [{ type: NODE_TYPES.TEXT, children: [{ text: "" }] }] as NodeType[]
			editorSo.state.editor = editor



			const docId = editorSo.state.docId


			clientObjects.observe(docId, (data) => {
				const children = clientObjects.getObject(docId).valueTemp
				SlateApplicator.UpdateChildren(editor, children)
			})
			await clientObjects.init(docId, true)

			// [II] e onDestroy unobserve????
		},


		//#endregion

	},

	mutators: {
		setFormatOpen: (formatOpen: boolean) => ({ formatOpen }),
	},
}

export type TextEditorState = typeof setup.state & ViewState & EditorState
export type TextEditorGetters = typeof setup.getters
export type TextEditorActions = typeof setup.actions
export type TextEditorMutators = typeof setup.mutators
export interface TextEditorStore extends ViewStore, TextEditorGetters, TextEditorActions, TextEditorMutators {
	state: TextEditorState
	onCreated: (_: void, store?: ViewStore) => Promise<void>;
}
const txtEditorSetup = mixStores(viewSetup, setup)
export default txtEditorSetup

//const initValue = [{ type: NODE_TYPES.TEXT, children: [{ text: "" }] }]
// const initValue = [
// 	{
// 		type: NODE_TYPES.CHAPTER,
// 		children: [{ text: "Dibattito sull'essere umano e le sue interazioni col mondo" }],
// 	},
// 	{
// 		type: NODE_TYPES.PARAGRAPH,
// 		children: [{ text: "Il primo scontro: il conetto dello spurgo" }],
// 	},
// 	{
// 		type: NODE_TYPES.TEXT,
// 		children: [{ text: "Vorrei sottolineare in questa occasione che l'alalisi è stata condotta su topi e non su veri esseri umani\nMa il concetto è lo stesso dai cioe' c'hanno entrambi la bocca no?" }],
// 	},
// 	{
// 		type: NODE_TYPES.PARAGRAPH,
// 		children: [{ text: "Raccontiamoci" }],
// 	},
// 	{
// 		type: NODE_TYPES.TEXT,
// 		children: [{ text: "In questo capitolo aaaa no è un paragrafo! Ok, in questo \"paragrafo\" mi preme qualcosa da dire ma non la dirò per evitare di attivare quel discorso che ci porterebbe al punto 23." }],
// 	},
// 	{
// 		type: NODE_TYPES.TEXT,
// 		children: [{ text: "Questo è un codice di esempio:" }],
// 	},

// 	{
// 		type: NODE_TYPES.CODE,
// 		children: [{ text: "{ pippo: 45, serafino: 'update' }" }],
// 	},

// ]


