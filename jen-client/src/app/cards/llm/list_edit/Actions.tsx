import agentSo from "@/stores/stacks/agent/repo"
import { LlmListStore } from "@/stores/stacks/llm/list"
import { Button, CircularLoadingCmp, OptionsCmp } from "@priolo/jack"
import { FunctionComponent } from "react"



interface Props {
	store?: LlmListStore
}

const ActionsCmp: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	// useStore(store.state.group)
	// useStore(store)


	// HOOKs


	// HANDLER
	const handleCancel = () => store.delete()
	const handleNew = () => store.create()


	// LOADING
	if (store.state.disabled) {
		return <CircularLoadingCmp style={{ width: 25, height: 25, color: "rgba(0,0,0,.5)" }} />
	}


	// RENDER
	const newSelected = store.isNewOpen()
	const selectedId = store.getSelected() 

	return <>
		<OptionsCmp
			style={{ marginLeft: 5, backgroundColor: "rgba(255,255,255,.4)" }}
			store={agentSo}
			storeView={store}
		/>
		<div style={{ flex: 1 }} />

		<Button
			children="DELETE"
			onClick={handleCancel}
			disabled={!selectedId || newSelected}
		/>
		<Button
			select={newSelected}
			children="NEW"
			onClick={handleNew}
		/>

	</>
}

export default ActionsCmp
