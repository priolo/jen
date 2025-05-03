import { Editor, Node, Point, Transforms } from "slate";



/**
 * Aggiorna il contenuto di un editor con un nuovo array di children
 */
// export function updateEditorChildren(editor: Editor, newChildren: any[]) {
// 	Editor.withoutNormalizing(editor, () => {
// 		editor.children = newChildren;
// 		if (!editor.selection) return;
// 		const { anchor, focus } = editor.selection;
// 		const adjustedAnchor = adjustPoint(editor, anchor);
// 		const adjustedFocus = adjustPoint(editor, focus);
// 		if (adjustedAnchor && adjustedFocus) {
// 			Transforms.select(editor, { anchor: adjustedAnchor, focus: adjustedFocus });
// 		}
// 	})
// }

/**
 * mi assicuro che un Point non esca fuori dal contenuto di un Editor
 */
// function adjustPoint(editor: Editor, point: Point): Point {
// 	const indexMax = editor.children.length - 1
// 	if (point.path[0] > indexMax) return {
// 		offset: 0,
// 		path: [indexMax,0]
// 	}
// 	const [node] = Editor.node(editor, point.path);
// 	const textLength = Node.string(node).length;
// 	return {
// 		path: point.path,
// 		offset: Math.min(point.offset, textLength)
// 	};
// }