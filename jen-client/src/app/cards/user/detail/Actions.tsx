import { AccountDetailStore } from "@/stores/stacks/account/detail"
import { EDIT_STATE } from "@/types"
import { Button, CircularLoadingCmp } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"



interface Props {
	store: AccountDetailStore
}

const AccauntDetailActions: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store.state.group)
	const cnnDetailSa = useStore(store)

	
	// HOOKs


	// HANDLER
	const handleInviteClick = async () => store.setEditState(EDIT_STATE.EDIT)


	// LOADING
	if (cnnDetailSa.disabled) {
		return <CircularLoadingCmp style={{ width: 25, height: 25, color: "rgba(0,0,0,.5)" }} />
	}


	// RENDER

	return <>
		<Button
			children="INVITE"
			onClick={handleInviteClick}
		/>
	</>
}

export default AccauntDetailActions
