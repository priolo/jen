import RowButton from "@/components/buttons/RowButton"
import FrameworkCard from "@/components/cards/FrameworkCard"
import SendIcon from "@/icons/SendIcon"
import chatSo, { getMainRoom } from "@/stores/stacks/chat/repo"
import { RoomDetailStore } from "@/stores/stacks/room/detail/detail"
import { ChatMessage } from "@/types/commons/RoomActions"
import { FloatButton, TextInput } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useMemo } from "react"
import EditorIcon from "../../../../icons/EditorIcon"
import clsCard from "../../CardCyanDef.module.css"
import ActionsCmp from "./Actions"
import MessageCmp from "./history/MessageCmp"
import RoleDialog from "./RoleDialog"



interface Props {
	store?: RoomDetailStore
}

const RoomView: FunctionComponent<Props> = ({
	store,
}) => {

	
	// STORE
	useStore(store)
	useStore(chatSo)


	// HOOKs


	// HANDLER
	const handleSendClick = () => store.sendPrompt()
	const handleOpenSubroom = (chatMessage: ChatMessage) => store.openSubRoom(chatMessage)
	const handleAgentsClick = () => store.openAgents()


	// RENDER
	useEffect(() => {
		store.fetch()
	}, [])

	useEffect(() => {
		if ( !!store.state.roomId ) return
		// se è una nuova ROOM allora la setto
		const chat = chatSo.getChatById( store.state.chatId )
		const room = getMainRoom( chat?.rooms )
		store.setRoomId(room?.id)
	}, [chatSo.state.all])

	/** la ROOM rappresentata  */
	const { room, history } = useMemo(()=>{
		if ( !store.state.roomId ) return { room: null, agents: [], history: [] }
		const room = chatSo.getRoomById(store.state.roomId)
		const history = room?.history ?? []
		return { room, history }
	}, [store.state.roomId])
	
	return <FrameworkCard
		className={clsCard.root}
		icon={<EditorIcon />}
		store={store}
		actionsRender={<ActionsCmp store={store} />}
		iconizedRender={null}
	>

		<div className="lyt-v">
			<div className="jack-lbl-prop">ROOM ID</div>
			<div className="jack-lbl-readonly">{room?.id ?? "--"}</div>
			<div className="jack-lbl-prop">ROOM PARENT ID</div>
			<div className="jack-lbl-readonly">{room?.parentRoomId ?? "--"}</div>
		</div>

		<RowButton
			icon={<EditorIcon />}
			label="AGENTS"
			onClick={handleAgentsClick}
		/>

		<div style={{ backgroundColor: "var(--jack-color-bg)", flex: 1 }}>
			{history.map((chatMessage) => (
				<MessageCmp
					key={chatMessage.id}
					message={chatMessage}
					onAskToClick={() => handleOpenSubroom(chatMessage)}
				/>
			))}
		</div>

		<TextInput
			value={store.state.prompt}
			onChange={v => store.setPrompt(v)}
			placeholder="Test input"
		/>

		<div className="jack-lyt-float">
			<FloatButton
				onClick={handleSendClick}
				disabled={false}
			><SendIcon /></FloatButton>
		</div>

		<RoleDialog store={store} />

	</FrameworkCard>
}

export default RoomView

