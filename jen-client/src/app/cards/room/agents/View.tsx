import FrameworkCard from "@/components/cards/FrameworkCard"
import chatRepoSo from "@/stores/stacks/chat/repo"
import { RoomAgentsListStore } from "@/stores/stacks/room/roomAgentsList"
import { EDIT_STATE } from "@/types"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import EditorIcon from "@/icons/EditorIcon"
import clsCard from "../../CardCyanDef.module.css"
import ActionsCmp from "./Actions"
import RoomAgentListEditForm from "./EditForm"
import RoomAgentListReadForm from "./ReadForm"



interface Props {
	store?: RoomAgentsListStore
}

const RoomAgentListView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)
	useStore(store.state.group)
	//useStore(agentSo)
	useStore(chatRepoSo)


	// HOOKs
	useEffect(() => {
		store.fetch()
		//}, [chatRepoSo.getRoomById(store.state.roomId)?.agentsIds])
	}, [chatRepoSo.state.all])


	// HANDLER


	// RENDER
	const inEdit = store.state.editState != EDIT_STATE.READ

	return <FrameworkCard
		className={clsCard.root}
		icon={<EditorIcon />}
		store={store}
		iconizedRender={null}
		actionsRender={<ActionsCmp store={store} />}
	>
		{inEdit && <RoomAgentListEditForm store={store} />}

		{!inEdit && <RoomAgentListReadForm store={store} />}

		{/* <AlertDialog store={store} /> */}

	</FrameworkCard>
}

export default RoomAgentListView
