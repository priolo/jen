import { Node, Operation } from "slate"
import { ReactEditor } from "slate-react"
import { sendCommands } from "@/plugins/docsService"


/**
 * Aggiunge funzionalità a slate
 */
export const withJess = (editor: ReactEditor, ) => {

	const se = editor as JessEditor
	//se.actionsDisabled = false
	/** lo store che contiene questo editor */
	const { apply, insertData } = editor;

	editor.apply = (operation: Operation) => {
		console.log("apply", operation)
		// sincronizza con il server 
		sendCommands(se.docId, operation)
		apply(operation);
	};

	editor.insertData = (data: DataTransfer) => {
		const text = data.getData('text/plain');
		if (text) {
			const lines = text.split('\n\n');
			const fragment = lines.map(line => ({
				type: 'paragraph',
				children: [{ text: line }],
			}));
			editor.insertFragment(fragment);
			return;
		}
		insertData(data);
	}

	se.onCopy = (event: ClipboardEvent) => {
		const { selection } = editor;
		if (selection) {
			const fragment = editor.getFragment();
			const string = JSON.stringify(fragment);
			event.clipboardData.setData('application/json', string);
			event.clipboardData.setData('text/plain', Node.string({ children: fragment }));
			event.preventDefault();
		}
	};

	// se.setTypeOnSelect = (type: NODE_TYPES) => {
	// 	// Non fare nulla se non c'è una selezione o se la selezione è collassata
	// 	if (!editor.selection) return;
	// 	editor.setNodes<NodeType>({ type })
	// }

	return se
}

export interface JessEditor extends ReactEditor {
	docId?: string
	//setTypeOnSelect: (type: NODE_TYPES) => void
	onCopy: (event: ClipboardEvent) => void
}