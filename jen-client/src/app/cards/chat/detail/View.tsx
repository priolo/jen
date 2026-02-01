import FrameworkCard from "@/components/cards/FrameworkCard"
import { ChatDetailStore } from "@/stores/stacks/chat/detail"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import ConnectionIcon from "../../../../icons/cards/ConnectionIcon"
import clsGreen from "../../CardGreen.module.css"
import ChatDetailActions from "./Actions"
import ChatDetailForm from "./Form"
import { EDIT_STATE } from "@/types"



interface Props {
	store?: ChatDetailStore
}

const ChatDetailView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)


	// HOOKs
	useEffect(() => {
		if (store.state.editState != EDIT_STATE.READ) return
		store.fetch()
	}, [store.state.editState])


	// HANDLER


	// RENDER
	return <FrameworkCard
		className={clsGreen.root}
		icon={<ConnectionIcon />}
		store={store}
		actionsRender={<ChatDetailActions store={store} />}
		iconizedRender={
			<div className="lyt-v lyt-v-btts">
			</div>
		}
	>

		<ChatDetailForm store={store} />

	</FrameworkCard>
}

export default ChatDetailView
