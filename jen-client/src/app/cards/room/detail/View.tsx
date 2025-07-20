import FrameworkCard from "@/components/cards/FrameworkCard"
import SendIcon from "@/icons/SendIcon"
import agentSo from "@/stores/stacks/agent/repo"
import { RoomDetailStore } from "@/stores/stacks/room/detail/detail"
import { Agent } from "@/types/Agent"
import { Button, FloatButton, ListDialog2, TextInput } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import EditorIcon from "../../../../icons/EditorIcon"
import clsCard from "../../CardCyanDef.module.css"
import ActionsCmp from "./Actions"
import MessageCmp from "./MessageCmp"
import RoleDialog from "./RoleDialog"



interface Props {
	store?: RoomDetailStore
}

const RoomView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)


	// HOOKs


	// HANDLER
	const handleAgentChange = (agentId: string) => {
		store.setRoom({ ...store.state.room, agentId })
	}

	const handleSendClick = () => {
		store.sendPrompt()
	}


	// RENDER
	const history = store.state.room?.history ?? []
	const agents = agentSo.state.all ?? []
	const agentSelected = agentSo.state.all.find((a: Agent) => a.id === store.state.room?.agentId)
	const selectedAgentId = store.state.room?.agentId

	return <FrameworkCard
		className={clsCard.root}
		icon={<EditorIcon />}
		store={store}
		actionsRender={<ActionsCmp store={store} />}
		iconizedRender={null}
	>

		<div className="lyt-v">
			<div className="jack-lbl-prop">AGENT</div>
			<div className="jack-lbl-readonly">{agentSelected?.name ?? "--"}</div>
			<div className="jack-lbl-prop">ROOM ID</div>
			<div className="jack-lbl-readonly">{store.state.room?.id ?? "--"}</div>
			<div className="jack-lbl-prop">ROOM PARENT ID</div>
			<div className="jack-lbl-readonly">{store.state.room?.parentRoomId ?? "--"}</div>
		</div>



		<div style={{ backgroundColor: "var(--jack-color-bg)", flex: 1 }}>
			{history.map((msg) => (
				<MessageCmp
					key={msg.id}
					message={msg}
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

