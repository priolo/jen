import { GetAllCards } from "@/stores/docs/cards";
import { forEachViews } from "@/stores/docs/utils/manage";
import { Path } from "slate";
import { PromptDetailStore } from "../detail";
import { ViewStore } from "../../../viewBase";
import { PROMPT_ROLES, NodeType } from "../slate/types";
import { SugarEditor } from "../slate/withSugar";


/**
 * Restituisco la Path di dove è posizionata una CARD-BLOCK attraverso il suo uuid
 */
export function findCardPathsByUuid(editor: SugarEditor, uuid: string) {
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
			const paths = findCardPathsByUuid((<PromptDetailStore>view).state.editor, uuid)
			if (paths.length > 0) return { view, paths }
			return null
		}
	)
}


