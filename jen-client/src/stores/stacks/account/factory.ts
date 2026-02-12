import { buildStore } from "@/stores/docs/utils/factory";
import { DOC_TYPE } from "@/types";
import { AccountDetailState, AccountDetailStore } from "./detail";
import { AccountFinderState, AccountFinderStore } from "./finder";
import { ChatPartecipantsListState, ChatPartecipantsListStore } from "../chat/partecipantsList";



/**
 * Costruisce la CARD per il dettaglio di un ACCOUNT
 */
export function buildAccountDetail(state:Partial<AccountDetailState>) {
	const store = buildStore({
		type: DOC_TYPE.ACCOUNT_DETAIL,
		...state,
	} as AccountDetailState) as AccountDetailStore
	return store;
}

/**
 * Costruisce la CARD per la lista di ACCOUNT
 */
export function buildAccountList(state: Partial<ChatPartecipantsListState> = {}) {
	const store = buildStore({
		type: DOC_TYPE.ACCOUNT_LIST,
		...state,
	} as ChatPartecipantsListState) as ChatPartecipantsListStore
	return store;
}

/**
 * Costruisce la CARD per la lista di ACCOUNT
 */
export function buildAccountFinder(state: Partial<AccountFinderState> = {}) {
	const store = buildStore({
		type: DOC_TYPE.ACCOUNT_FINDER,
		...state,
	} as AccountFinderState) as AccountFinderStore
	return store;
}