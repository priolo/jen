import { buildStore } from "@/stores/docs/utils/factory";
import { DOC_TYPE } from "@/types";
import { AccountDetailState, AccountDetailStore } from "./detail";
import { AccountListState, AccountListStore } from "./list";
import { Account } from "./types";



/**
 * Costruisce la CARD per il dettaglio di un ACCOUNT
 */
export function buildAccountDetailCard(account: Partial<Account>) {
	const store = buildStore({
		type: DOC_TYPE.ACCOUNT_DETAIL,
		account: account,
	} as AccountDetailState) as AccountDetailStore
	return store;
}

/**
 * Costruisce la CARD per la lista di ACCOUNT
 */
export function buildAccountListCard() {
	const store = buildStore({
		type: DOC_TYPE.ACCOUNT_LIST,
	} as AccountListState) as AccountListStore
	return store;
}