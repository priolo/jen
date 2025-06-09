import { ReactEditor } from "slate-react"
import { RoomDetailStore } from "../../../stores/stacks/room/detail/detail"


/**
 * EditorSLATE con il riferimento allo STORE
 */
export const withStore = (editor: ReactEditor) => {
	const se = editor as StoreEditor

	/** lo store che contiene questo editor */
	se.store = null

	return se
}

export interface StoreEditor extends ReactEditor {
	store?: RoomDetailStore
}