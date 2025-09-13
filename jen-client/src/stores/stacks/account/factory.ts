import { buildStore } from "@/stores/docs/utils/factory";
import { DOC_TYPE } from "@/types";
import { AccountListState, AccountListStore } from "./list";



export function buildUserCard() {
	const store = buildStore({
		type: DOC_TYPE.USER,
	} as AccountListState) as AccountListStore
	return store;
}



export function buildLoginCard() {
	const store = buildStore({
		type: DOC_TYPE.ACCOUNT_LIST,
	} as AccountListState) as AccountListStore
	return store;
}