import { RoomDetailState, RoomDetailStore } from "@/stores/stacks/room/detail/detail"
import { Dialog, List } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



interface Props {
	store?: RoomDetailStore
}

const RoleDialog: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store) as RoomDetailState

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
		// The 'selection' variable is captured from store.state.editor.selection
		// after the initial type setting. We use it here to apply the dynamically chosen type.
		// This will override the type set by the preceding store.state.editor.setNodes call.
		if (selection) {
			// Assuming PROMPT_ROLES is an enum or an object where values are the role strings.
			// e.g., enum PROMPT_ROLES { USER = "user", SYSTEM = "system", ... }
			// Object.values(PROMPT_ROLES) would give ["user", "system", ...]
			const roleValues = Object.values(PROMPT_ROLES) as string[];

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
					items={["pippo", "pluto", "paperino"]}
					onSelect={handleSelect}
				/>

			</div>
		</Dialog>
	)

}

export default RoleDialog

