import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import { EditorCodeStore } from "../../../stores/stacks/editorCode"
import { Button } from "@priolo/jack"



interface Props {
	store?: EditorCodeStore
}

const ActionsCmp: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	const state = useStore(store)

	// HOOKs

	// HANDLER
	const handleSaveClick = async () => console.log("save")
	const handleCancelClick = async () => console.log("cancel")

	// RENDER
	return (<>
		<Button
			children="SAVE"
			onClick={handleSaveClick}
		/>
		<Button
			children="CANCEL"
			onClick={handleCancelClick}
		/>
	</>)
}

export default ActionsCmp
