import aboutSetup from "@/stores/stacks/about";
import txtEditorSetup from "@/stores/stacks/editor";
import editCodeSetup from "@/stores/stacks/editorCode";
import helpSetup from "@/stores/stacks/help";
import logsSetup from "@/stores/stacks/log";
import usersSetup from "@/stores/stacks/streams";
import userSetup from "@/stores/stacks/streams/detail";
import accountSetup from "@/stores/stacks/account";
import { DOC_TYPE } from "@/types";
import { createStore } from "@priolo/jon";
import { ViewState, ViewStore } from "../../stacks/viewBase";
import reflectionSetup from "../../stacks/reflection";



/** genera un uuid per un DOC */
export function createUUID(): string {
	var dt = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
		/[xy]/g,
		(c) => {
			let r = (dt + (Math.random() * 16)) % 16 | 0;
			dt = Math.floor(dt / 16);
			return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		}
	)
	return uuid;
}

/** crea lo STORE adeguato */
export function buildStore(state: Partial<ViewState>): ViewStore {
	const setup = {

		[DOC_TYPE.USERS]: usersSetup,
		[DOC_TYPE.USER]: userSetup,

		[DOC_TYPE.LOGS]: logsSetup,
		[DOC_TYPE.ABOUT]: aboutSetup,

		[DOC_TYPE.TEXT_EDITOR]: txtEditorSetup,
		[DOC_TYPE.CODE_EDITOR]: editCodeSetup,
		[DOC_TYPE.REFLECTION]: reflectionSetup,
		[DOC_TYPE.HELP]: helpSetup,

		[DOC_TYPE.ACCOUNT]: accountSetup,
		
	}[state?.type]
	if (!setup) return
	const store: ViewStore = <ViewStore>createStore(setup)
	store.state = { ...store.state, ...state }
	// se non c'e' l'uuid lo creo IO!
	if (store.state.uuid == null) store.state.uuid = createUUID()
	store.onCreated()
	return store
}
