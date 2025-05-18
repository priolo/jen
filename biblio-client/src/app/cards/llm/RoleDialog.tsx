
import { AgentState, AgentStore } from "@/stores/stacks/agent"
import { Dialog } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



interface Props {
	store?: AgentStore
}

const RoleDialog: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	const state = useStore(store) as AgentState

	// HOOKs

	// HANDLER
	const handleClose = () => {
		store.setRoleDialogOpen(false)
	}

	// RENDER
	return (
		<Dialog noCloseOnClickParent
			className="var-dialog"
			store={store}
			title={"PIPPO"}
			width={85}
			open={state.roleDialogOpen}
			onClose={handleClose}
		>
			<div className="lyt-form">

				CIAO

			</div>
		</Dialog>
	)

}

export default RoleDialog

