import { PROMPT_ROLES } from "@/components/slate/elements/room/types"
import { TextEditorStore } from "@/stores/stacks/editor"
import { RoomDetailState, RoomDetailStore } from "@/stores/stacks/room/detail/detail"
import { Dialog, List } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



interface Props {
	store?: TextEditorStore
}

const RoleDialog: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)

	// HOOKs

	// HANDLER
	const handleClose = () => {
		store.setRoleDialogOpen(false)
	}
	const handleSelect = (index: number, e) => {
		store.setRoleDialogOpen(false)
		store.state.editor.setNodes({ type: PROMPT_ROLES.SYSTEM })
		const { selection } = store.state.editor
		if (selection) {
			// Use selection here
			console.log(selection)
		}

		if (selection) {
			// Check if the selected index is valid for the available roles.
			if (index >= 0 && index < roleValues.length) {
				const newType = roleValues[index];

				// Set the 'type' property of the selected Slate element(s).
				// This assumes store.state.editor.setNodes correctly targets the current selection.
				store.state.editor.setNodes({ type: newType });
			}
		}
	}

	// RENDER
	const roleValues = Object.values(PROMPT_ROLES) as string[];


	return (
		<Dialog
			className="var-dialog"
			store={store}
			title={"PIPPO"}
			width={85}
			open={store.state.roleDialogOpen}
			onClose={handleClose}
		>
			<div className="lyt-form">

				<List<string>
					items={roleValues}
					onSelect={handleSelect}
				/>

			</div>
		</Dialog>
	)

}

export default RoleDialog

