import { clientObjects } from "@/plugins/docsService"
import viewSetup, { ViewState, ViewStore } from "@/stores/stacks/viewBase"
import { mixStores } from "@priolo/jon"
import { createEditor, Editor, Transforms } from "slate"
import { withHistory } from 'slate-history'
import { withReact } from "slate-react"
import { EditorState } from "../editorBase"
//import { updateEditorChildren } from "./utils/slate"
import { SlateApplicator } from "@priolo/jess"
import { DragDoc } from "@priolo/jack"
import { JessEditor, withJess } from "@/components/slate/editors/withJess"
import { NodeType, PROMPT_ROLES } from "@/components/slate/elements/room/types"
import { NODE_TYPES } from "@/components/slate/elements/doc/types"
import { createUUID } from "@/stores/docs/utils/factory"



const setup = {

	state: {

		/** AGENT origine */
		agentId: <string>null,
		/** LLM da utilizzare */
		llmId: <string>null,

		/** id della HISTORY */
		historyId: <string>null,

		/** SLATE editor */
		editor: <JessEditor>null,

		/** testo iniziale */
		initValue: <NodeType[]>[{ type: PROMPT_ROLES.SYSTEM, children: [{ text: "" }] }],

		/** indica che la dialog ROLE è aperta */
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

			if (!editorSo.state.historyId) {
				editorSo.state.historyId = createUUID()
				const docId = editorSo.state.historyId

				const editor: JessEditor = withJess(withHistory(withReact(createEditor())))
				editor.docId = docId
				//editor.children = editorSo.state.initValue
				editorSo.state.editor = editor

				// esegue le varie connessioni jess
				clientObjects.observe(docId, (data) => {
					console.log("observe", data)
					const children = clientObjects.getObject(docId).valueTemp
					SlateApplicator.UpdateChildren(editor, children)
				})

				clientObjects.init(docId, false)
				editor.insertNodes(editorSo.state.initValue);
				//editorSo.setEditorContent(editorSo.state.initValue)
				await clientObjects.update()

				return
			}


			const docId = editorSo.state.historyId

			// creo l'editor SLATE e lo assegno allo state
			const editor: JessEditor = withJess(withHistory(withReact(createEditor())))
			editor.docId = docId
			//editor.children = editorSo.state.initValue
			editorSo.state.editor = editor

			// esegue le varie connessioni jess
			clientObjects.observe(docId, (data) => {
				const children = clientObjects.getObject(docId).valueTemp
				SlateApplicator.UpdateChildren(editor, children)
			})
			await clientObjects.init(docId, true)
			// [II] e onDestroy unobserve????
		},

		execute: async (_: void, store?: ViewStore) => {
			console.log("execute")
		},

		/** Sostituisce tutto il contenuto dell'editor utilizzando le API native di Slate */
		setEditorContent: (content: NodeType[], store?: ViewStore) => {
			const editorSo = store as TextEditorStore
			const editor = editorSo.state.editor

			if (!editor) {
				console.warn("Editor non ancora inizializzato")
				return
			}

			// Utilizza Editor.withoutNormalizing per raggruppare tutte le operazioni
			Editor.withoutNormalizing(editor, () => {
				// Seleziona tutto il contenuto esistente
				const start = Editor.start(editor, []);
				const end = Editor.end(editor, []);
				const range = { anchor: start, focus: end };

				// Rimuove tutto il contenuto esistente
				Transforms.removeNodes(editor, { at: range });

				// Inserisce il nuovo contenuto
				Transforms.insertNodes(editor, content, { at: [0] });

				// Imposta il cursore all'inizio del documento
				Transforms.select(editor, Editor.start(editor, []));
			});
		},

		//#endregion
	},

	mutators: {
		setFormatOpen: (formatOpen: boolean) => ({ formatOpen }),

		setRoleDialogOpen: (roleDialogOpen: boolean) => ({ roleDialogOpen }),
	},
}

export type TextEditorState = typeof setup.state & ViewState & EditorState
export type TextEditorGetters = typeof setup.getters
export type TextEditorActions = typeof setup.actions
export type TextEditorMutators = typeof setup.mutators
export interface TextEditorStore extends ViewStore, TextEditorGetters, TextEditorActions, TextEditorMutators {
	state: TextEditorState
	onCreated: (_: void, store?: ViewStore) => Promise<void>;
	setEditorContent: (content: NodeType[], store?: ViewStore) => void;
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


