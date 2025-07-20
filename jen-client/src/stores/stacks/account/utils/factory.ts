import { buildStore } from "@/stores/docs/utils/factory";
import { DOC_TYPE } from "@/types";
import { AccountState, AccountStore } from "..";



export function buildUserCard() {
	const store = buildStore({
		type: DOC_TYPE.USER,
	} as AccountState) as AccountStore
	return store;
}
