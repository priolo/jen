import { DocState } from "@/stores/docs";
import { Log } from "@/stores/log/utils";
import { ViewState } from "@/stores/stacks/viewBase";



export interface Session {
	/** STATE di tutte le CARDs (menu, drawer, deck...)*/
	allStates: Partial<ViewState>[]
	/** STATE dello STORE DOC */
	docsState: Partial<DocState>
	/** CARD UUID presenti nel DECK */
	deckUuids: string[]
	/** CARD UUID presenti nel DRAWER */
	drawerUuids: string[]
	/** CARD UUID presenti nel MENU */
	menuUuids: string[]
	/** messagi LOGs */
	logs: Log[]
}