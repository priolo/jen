import { Editor, Element, Range, Transforms } from "slate";
import { NodeType, PROMPT_ROLES } from "../elements/agent/types";
import { StoreEditor } from "../editors/withStore";



export function mdOnKeyDown(event: React.KeyboardEvent<HTMLDivElement>, editor: StoreEditor, node?: NodeType) {
	if (event.key == "Enter") {
		if (event.ctrlKey || event.altKey || event.shiftKey) {
			event.preventDefault();
			editor.insertBreak()
			return false
		} else {
			event.preventDefault();
			editor.insertText("\n")
			return false
		}
	} else if (event.key == "Tab") {
		event.preventDefault();
		if (!editor.selection) return
		// Get the selected text
		const [start, end] = Range.edges(editor.selection);
		// Apply the tab character (or spaces for tab)
		const tab = '   '; // You can replace this with '\t' if you want a real tab character
		editor.insertText(tab, { at: start });
		// Move the cursor after the inserted tab
		//editor.move({ distance: tab.length, unit: 'character' });
	}
	if (event.key == "Backspace" || event.key == "Delete") {
		if (!editor.selection) return
		const [start, end] = Range.edges(editor.selection);
		if (start.path[0] == 0 && start.offset == 0) {
			event.preventDefault();
			editor.removeNodes({ at: start })
		}
	}
	if (event.altKey && event.key === 'l') {
		event.preventDefault();
		console.log(editor.children);
	}
	if (event.altKey && event.key === 'u') {
        event.preventDefault();
        if (editor.selection) {
            if (Range.isCollapsed(editor.selection)) {
                // If the selection is collapsed, change the type of the current node
                const [match] = editor.nodes({
                    match: n => !Editor.isEditor(n) && Element.isElement(n),
                    mode: 'lowest', // or 'highest' depending on which element you want to target
                });
                if (match) {
                    editor.setNodes(
                        { type: PROMPT_ROLES.USER },
                        { at: match[1] }
                    );
                }
            } else {
                // If there is a selection, wrap the selected text in a new USER node
                Editor.withoutNormalizing(editor, () => {
                    const selectionRange = editor.selection; // Capture the current selection range
                    const selectedText = Editor.string(editor, selectionRange);
                    
                    // Process selectedText: replace newlines with spaces and trim whitespace.
                    const processedText = selectedText.replace(/\n/g, ' ').trim();

                    if (processedText.length > 0) {
                        // Define the new user node
                        const userNode: NodeType = {
                            // @ts-ignore 
                            type: PROMPT_ROLES.USER,
                            children: [{ text: processedText }],
                        };

                        // Delete the currently selected content using the captured selection range
                        Transforms.delete(editor, { at: selectionRange });
						editor.insertBreak()
                        
                        // Insert the new user node at the current selection
                        // (which should be collapsed at the deletion point).
                        // Slate will select the inserted node.
                        Transforms.insertNodes(editor, userNode, { select: true });
                    } else {
                        // If processed text is empty (e.g., selection was only newlines/spaces),
                        // just delete the content of the original selection.
                        Transforms.delete(editor, { at: selectionRange });
                    }
                });
            }
        }
    }


}
