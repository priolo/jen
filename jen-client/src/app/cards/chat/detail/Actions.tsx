import { ChatDetailStore } from "@/stores/stacks/chat/detail"
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
	const handleEdit = () => store.edit()
	const handleCancel = () => store.cancel()
	const handleSave = () => store.save()
	const handleOpen = async () => store.openMainRoom()

	
	// LOADING
	if (cnnDetailSa.disabled) {
		return <CircularLoadingCmp style={{ width: 25, height: 25, color: "rgba(0,0,0,.5)" }} />
	}


	// RENDER
	if (cnnDetailSa.editState == EDIT_STATE.NEW) {
		return <Button
			children="CREATE"
			onClick={handleSave}
		/>

	} else if (cnnDetailSa.editState == EDIT_STATE.READ) {
		return <>
			<Button
				children="OPEN"
				onClick={handleOpen}
			/>
			<Button
				children="EDIT"
				onClick={handleEdit}
			/>
		</>
	}

	return <>
		<Button
			children="SAVE"
			onClick={handleSave}
		/>
		<Button
			children="CANCEL"
			onClick={handleCancel}
		/>
	</>
}

export default ChatDetailActions
