import { AgentDetailStore } from "@/stores/stacks/agent/detail"
import agentSo from "@/stores/stacks/agent/repo"
import chatRepoSo from "@/stores/stacks/chat/repo"
import { RoomAgentsListStore } from "@/stores/stacks/room/roomAgentsList"
import { IconToggle } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { AgentDTO } from "@shared/types/AgentDTO"
import { FunctionComponent, useEffect, useMemo } from "react"
import clsCard from "../../CardCyanDef.module.css"



interface Props {
	store?: RoomAgentsListStore
}

const RoomAgentListEditForm: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)
	// useStore(store.state.group)
	// useStore(agentSo)
	// useStore(chatRepoSo)


	// HOOKs
	useEffect(() => {
		store.fetch()
	//}, [chatRepoSo.getRoomById(store.state.roomId)?.agentsIds])
	}, [chatRepoSo.state.all])

	const selected = store.state.agentsInEdit ?? []
	const selectable = useMemo(
		() => store.getSelectableAgents(), 
		[agentSo.state.all, store.state.agentsInEdit]
	)


	// HANDLER
	const handleSelect = (agent: AgentDTO) => store.openDetail(agent.id)
	const handleAdd = (agent: AgentDTO) => store.addAgent(agent)
	const handleRemove = (agent: AgentDTO) => store.removeAgent(agent)


	// RENDER
	const selectId = (store.state.linked as AgentDetailStore)?.state?.agent?.id
	const isSelected = (agent: AgentDTO) => agent.id == selectId
	const isChecked = (agent: AgentDTO) => null //store.state.selectedIds.includes(agent.id)

	return <div>
		<div className="jack-lbl-prop">SELECTED</div>

		<div className={clsCard.content}>
			{selected?.map((agent) => {
				return <div key={agent.id} style={{ display: "flex" }}>
					<IconToggle
						check={isChecked(agent)}
						onChange={(check) => handleRemove(agent)}
					/>
					<div
						onClick={(e) => handleSelect(agent)}
					>{agent.name} {isSelected(agent) ? "**" : ""}</div>
				</div>
			})}

			{!selected?.length &&
				<div className="jack-lbl-empty">NO AGENTS SELECTED</div>
			}

			<div className="jack-divider-h" />

			<div className="jack-lbl-prop">SELECTABLE</div>

			{selectable?.map((agent) => {
				return <div key={agent.id} style={{ display: "flex" }}>
					<IconToggle
						check={isChecked(agent)}
						onChange={(check) => handleAdd(agent)}
					/>
					<div
						onClick={(e) => handleSelect(agent)}
					>{agent.name} {isSelected(agent) ? "**" : ""}</div>
				</div>
			})}

		</div>
		
	</div>
}

export default RoomAgentListEditForm
