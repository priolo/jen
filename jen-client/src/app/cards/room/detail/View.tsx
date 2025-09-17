import FrameworkCard from "@/components/cards/FrameworkCard"
import SendIcon from "@/icons/SendIcon"
import agentSo from "@/stores/stacks/agent/repo"
import { RoomDetailStore } from "@/stores/stacks/room/detail/detail"
import { AgentLlm } from "@/types/Agent"
import { FloatButton, TextInput } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import EditorIcon from "../../../../icons/EditorIcon"
import clsCard from "../../CardCyanDef.module.css"
import ActionsCmp from "./Actions"
import MessageCmp from "./history/MessageCmp"
import RoleDialog from "./RoleDialog"
import chatSo from "@/stores/stacks/chat/repo"
import { ChatMessage } from "@/types/commons/RoomActions"
import { buildRoomDetail } from "@/stores/stacks/room/factory"
import { ContentAskTo, LlmResponse } from "@/types/commons/LlmResponse"



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
	const handleSendClick = () => {
		store.sendPrompt()
	}
	const handleOpenSubroom = (chatMessage: ChatMessage) => {
		const content:ContentAskTo = (chatMessage?.content as LlmResponse)?.content as ContentAskTo
		if (!content) return

		const view = buildRoomDetail({
			chatId: store.state.chatId,
			roomId: content.roomId,
		})
		store.state.group.addLink({ view, parent: store, anim: true })
	}


	// RENDER
	const room = chatSo.getRoomById(store.state.roomId)
	const history = room?.history ?? []
	const agentRef = agentSo.state.all.find((a: AgentLlm) => a.id === room?.agentsIds[0])

	return <FrameworkCard
		className={clsCard.root}
		icon={<EditorIcon />}
		store={store}
		actionsRender={<ActionsCmp store={store} />}
		iconizedRender={null}
	>

		<div className="lyt-v">
			<div className="jack-lbl-prop">AGENT</div>
			<div className="jack-lbl-readonly">{agentRef?.name ?? "--"}</div>
			<div className="jack-lbl-prop">ROOM ID</div>
			<div className="jack-lbl-readonly">{room?.id ?? "--"}</div>
			<div className="jack-lbl-prop">ROOM PARENT ID</div>
			<div className="jack-lbl-readonly">{room?.parentRoomId ?? "--"}</div>
		</div>

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

