import { RoomDetailStore } from "@/stores/stacks/room/detail"
import { Button, CircularLoadingCmp } from "@priolo/jack"
import { FunctionComponent } from "react"



interface Props {
	store?: RoomDetailStore
}

const ActionsCmp: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	// useStore(store.state.group)
	// useStore(store)


	// HOOKs


	// HANDLER
	const handleChat = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation()
		store.openChat()
	}
	const handleAgents = () => store.openAgents()

	// LOADING
	
	// RENDER

	return <>
		<Button
			children="CHAT"
			onClick={handleChat}
		/>
		<Button
			children="AGENTS"
			onClick={handleAgents}
		/>
	</>
}

export default ActionsCmp
