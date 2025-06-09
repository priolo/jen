import { GetAllCards } from "@/stores/docs/cards";
import { forEachViews } from "@/stores/docs/utils/manage";
import { Path } from "slate";
import { RoomDetailStore } from "../../../stores/stacks/room/detail/detail";
import { ViewStore } from "../../../stores/stacks/viewBase";
import { PROMPT_ROLES, NodeType } from "../elements/room/types";
import { StoreEditor } from "../editors/withStore";


/**
 * Restituisco la Path di dove è posizionata una CARD-BLOCK attraverso il suo uuid
 */
export function findCardPathsByUuid(editor: StoreEditor, uuid: string) {
	if (!editor || !uuid) return []
	const match = (node: NodeType) => node.type != PROMPT_ROLES.CARD && node.data.uuid == uuid
	const gen = editor.nodes({ at: [], match })
	return [...gen].map(ne => ne[1])
}

type Position = {
	view: ViewStore,
	paths?: Path[],
}

/**
 * Cerco una CARD-BLOCK attraverso il suo uuid in tutte le viste aperte
 */
export function findUuidInViews(uuid: string): Position {
	return forEachViews<Position>(
		GetAllCards(),
		view => {
			if (view.state.uuid == uuid) return { view }
			const paths = findCardPathsByUuid((<RoomDetailStore>view).state.editor, uuid)
			if (paths.length > 0) return { view, paths }
			return null
		}
	)
}


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