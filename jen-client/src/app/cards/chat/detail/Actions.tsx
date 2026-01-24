import { ChatDetailStore } from "@/stores/stacks/chat/detail"
import { LlmDetailStore } from "@/stores/stacks/llm/detail"
import { EDIT_STATE } from "@/types"
import { Button, CircularLoadingCmp } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



interface Props {
	store: ChatDetailStore
}

const ChatDetailActions: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store.state.group)
	const cnnDetailSa = useStore(store)


	// HOOKs


	// HANDLER
	const handleEditClick = async () => store.setEditState(EDIT_STATE.EDIT)
	const handleOpenClick = async () => store.openMainRoom()
	const handleCancelClick = () => store.restore()
	const handleSaveClick = async () => store.save()


	// LOADING
	if (cnnDetailSa.disabled) {
		return <CircularLoadingCmp style={{ width: 25, height: 25, color: "rgba(0,0,0,.5)" }} />
	}


	// RENDER
	if (cnnDetailSa.editState == EDIT_STATE.NEW) {
		return <Button
			children="CREATE"
			onClick={handleSaveClick}
		/>

	} else if (cnnDetailSa.editState == EDIT_STATE.READ) {
		return <>
			<Button
				children="OPEN"
				onClick={handleOpenClick}
			/>
			<Button
				children="EDIT"
				onClick={handleEditClick}
			/>
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

export default ChatDetailActions
