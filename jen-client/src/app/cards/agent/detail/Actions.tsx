import { AgentDetailStore } from "@/stores/stacks/agent/detail"
import { EDIT_STATE } from "@/types"
import { Button, CircularLoadingCmp } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



interface Props {
	store?: AgentDetailStore
	style?: React.CSSProperties
}

const ActionsCmp: FunctionComponent<Props> = ({
	store,
	style,
}) => {

	// STORE
	useStore(store.state.group)
	const agentDetailSa = useStore(store)

	// HOOKs

	// HANDLER
	const handleEditClick = async () => store.setEditState(EDIT_STATE.EDIT)
	const handleCancelClick = () => store.restore()
	const handleSaveClick = async () => store.save()
	// const handleChatClick = () => store.openChatRoom()
	// const handleEditorClick = () => store.openEditor()


	// LOADING
	if (agentDetailSa.disabled) {
		return <CircularLoadingCmp style={{ width: 25, height: 25, color: "rgba(0,0,0,.5)" }} />
	}

	// RENDER
	if (agentDetailSa.editState == EDIT_STATE.NEW) {
		return <>
			<Button
				children="CREATE"
				onClick={handleSaveClick}
			/>
		</>

	} else if (agentDetailSa.editState == EDIT_STATE.READ) {
		return <>
			<Button
				children="EDIT"
				onClick={handleEditClick}
			/>
			{/* <Button
				children="CHAT"
				onClick={handleChatClick}
			/> */}
			{/* <Button
				children="EDITOR"
				onClick={handleEditorClick}
			/> */}
		</>
	}

	return <>
		<Button
			children="SAVE"
			onClick={handleSaveClick}
		/>
		<Button
			children="CANCEL"
			onClick={handleCancelClick}
		/>
	</>
}

export default ActionsCmp
