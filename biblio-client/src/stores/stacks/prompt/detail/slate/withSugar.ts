import { Node, Operation } from "slate"
import { ReactEditor } from "slate-react"
import { PromptDetailStore } from "../detail"
import { NodeType, PROMPT_ROLES } from "./types"


/**
 * Aggiunge funzionalità a slate
 */
export const withSugar = (editor: ReactEditor) => {
	const se = editor as SugarEditor
	//se.actionsDisabled = false
	/** lo store che contiene questo editor */
	se.store = null
	// const { apply, insertData } = editor;

	// editor.apply = (operation: Operation) => {
	// 	// sincronizza con il server 
	// 	//sendCommands(se.store.state.docId, operation)
	// 	apply(operation);
	// };

	// editor.insertData = (data: DataTransfer) => {
	// 	const text = data.getData('text/plain');
	// 	if (text) {
	// 		const lines = text.split('\n\n');
	// 		const fragment = lines.map(line => ({
	// 			type: 'paragraph',
	// 			children: [{ text: line }],
	// 		}));
	// 		editor.insertFragment(fragment);
	// 		return;
	// 	}
	// 	insertData(data);
	// }

	// se.onCopy = (event: ClipboardEvent) => {
	// 	const { selection } = editor;
	// 	if (selection) {
	// 		const fragment = editor.getFragment();
	// 		const string = JSON.stringify(fragment);
	// 		event.clipboardData.setData('application/json', string);
	// 		event.clipboardData.setData('text/plain', Node.string({ children: fragment }));
	// 		event.preventDefault();
	// 	}
	// };

	// se.setTypeOnSelect = (type: PROMPT_TYPES) => {
	// 	// Non fare nulla se non c'è una selezione o se la selezione è collassata
	// 	if (!editor.selection) return;
	// 	editor.setNodes<NodeType>({ type })
	// }

	return se
}

export interface SugarEditor extends ReactEditor {
	store?: PromptDetailStore
	//actionsDisabled?: boolean
	setTypeOnSelect: (type: PROMPT_ROLES) => void
	onCopy: (event: ClipboardEvent) => void
}