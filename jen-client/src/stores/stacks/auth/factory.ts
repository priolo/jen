import { buildStore } from "@/stores/docs/utils/factory";
import { DOC_TYPE } from "@/types";
import { AuthDetailState, AuthDetailStore } from "./detail";


/**
 * Costruisce la CARD riguardo l'accesso al sistema (LOOGIN/REGISTER/LOGOUT)
 */
export function buildAuthDetailCard() {
	const store = buildStore({
		type: DOC_TYPE.AUTH_DETAIL,
	} as AuthDetailState) as AuthDetailStore
	return store;
}