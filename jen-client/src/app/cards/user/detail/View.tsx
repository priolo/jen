import FrameworkCard from "@/components/cards/FrameworkCard"
import { UserStore } from "@/stores/stacks/streams/detail"
import { EDIT_STATE } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import ActionsCmp from "./Actions"
import Form from "./Form"
import LogIcon from "../../../../icons/LogIcon"
import clsCard from "@/app/cards/CardMintDef.module.css"



interface Props {
	store?: UserStore
}

const UserDetailView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	const streamSa = useStore(store)
	useStore(store.state.group)

	// HOOKs
	useEffect(() => {
		store.fetchIfVoid()
	}, [])

	// HANDLER

	// RENDER
	const inRead = streamSa.editState == EDIT_STATE.READ

	return <FrameworkCard
		icon={<LogIcon />}
		className={clsCard.root}
		store={store}
		actionsRender={<ActionsCmp store={store} />}
	>
		<Form store={store} />
	</FrameworkCard>
}

export default UserDetailView
