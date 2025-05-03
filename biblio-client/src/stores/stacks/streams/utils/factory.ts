import { buildStore } from "@/stores/docs/utils/factory";
import { DOC_TYPE, EDIT_STATE } from "@/types";
import { User } from "@/types/User";
import { UsersState, UsersStore } from "..";
import { UserState, UserStore } from "../detail";



//** new CARD of USERs COLECTION */
export function buildUsers() {
	const usersStore = buildStore({
		type: DOC_TYPE.USERS,
	} as UsersState) as UsersStore;
	return usersStore;
}

/** new CARD of USER */
export function buildUser( user: User ) {
	if (!user) { console.error("no param"); return null; }
	const store = buildStore({
		type: DOC_TYPE.USER,
		editState: EDIT_STATE.READ,
		user,
	} as UserState) as UserStore;
	return store;
}

