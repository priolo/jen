import { viewSetup, ViewStore } from "@priolo/jack"
import { buildStore } from "../docs/utils/factory"
export type { ViewMutators, ViewState, ViewStore } from "@priolo/jack"



const setSerializationBase = viewSetup.actions.setSerialization

viewSetup.actions.setSerialization = (state: any, store?: ViewStore) => {
	setSerializationBase(state, store)

	// recursion
	const linkedState = state.linked
	if (!!state.linked) delete state.linked
	if (linkedState) {
		const linkedStore = buildStore({ type: linkedState.type, group: store.state.group })
		linkedStore.setSerialization(linkedState)
		store.setLinked(linkedStore)
		linkedStore.onLinked()
	}
}

export default viewSetup

