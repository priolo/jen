import { McpToolDetailStore } from "@/stores/stacks/mcpTool/detail"
import { Button, CircularLoadingCmp } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



interface Props {
	store: McpToolDetailStore
}

const McpToolDetailActions: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store.state.group)
	const cnnDetailSa = useStore(store)
	
	// HOOKs

	// HANDLER
	const handleExecuteClick = async () => {
		await store.execute()
	}
	const handleOpenResultsClick = () => {
		store.openResults()
	}

	// LOADING
	if (cnnDetailSa.disabled) {
		return <CircularLoadingCmp style={{ width: 25, height: 25, color: "rgba(0,0,0,.5)" }} />
	}

	// RENDER
	return <>
		<Button
			children="EXECUTE"
			onClick={handleExecuteClick}
		/>
		<Button
			children="RESULTS"
			onClick={handleOpenResultsClick}
		/>

	</>
}

export default McpToolDetailActions
