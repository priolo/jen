import FrameworkCard from "@/components/cards/FrameworkCard"
import SendIcon from "@/icons/SendIcon"
import agentSo from "@/stores/stacks/agent/repo"
import { RoomDetailStore } from "@/stores/stacks/room/detail/detail"
import { EDIT_STATE } from "@/types"
import { Agent } from "@/types/Agent"
import { Button, FloatButton, ListDialog2, TextInput } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent } from "react"
import EditorIcon from "../../../../icons/EditorIcon"
import clsCard from "../../CardCyanDef.module.css"
import ActionsCmp from "./Actions"
import MessageCmp from "./MessageCmp"
import RoleDialog from "./RoleDialog"
import cls from "./View.module.css"



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
			<ListDialog2
				store={store}
				select={selectedAgentId}
				items={agents}
				readOnly={true}
				fnGetId={(item: Agent) => item?.id}
				fnGetString={(item: Agent) => item?.name}
				onChangeSelect={handleAgentChange}
			/>
			<Button
				onClick={() => console.log("Open agent dialog")}
			>Open</Button>
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

