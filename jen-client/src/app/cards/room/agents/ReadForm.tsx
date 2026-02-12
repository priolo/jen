import { AgentDetailStore } from "@/stores/stacks/agent/detail"
import { RoomAgentsListStore } from "@/stores/stacks/room/roomAgentsList"
import { useStore } from "@priolo/jon"
import { AgentDTO } from "@shared/types/AgentDTO"
import { FunctionComponent } from "react"
import clsCard from "../../CardCyanDef.module.css"



interface Props {
	store?: RoomAgentsListStore
}

const RoomAgentListReadForm: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)
	// useStore(store.state.group)
	// useStore(agentSo)
	// useStore(chatRepoSo)


	// HOOKs


	// HANDLER
	const handleSelect = (agent: AgentDTO) => store.openDetail(agent.id)


	// RENDER
	const agents = store.state.agents ?? []
	const selectId = (store.state.linked as AgentDetailStore)?.state?.agent?.id
	const isSelected = (agent: AgentDTO) => agent.id == selectId

	return <div className={clsCard.content}>

		{agents?.map((agent) =>

			<div key={agent.id}
				onClick={(e) => handleSelect(agent)}
			>
				{agent.name} {isSelected(agent) ? "**" : ""}
			</div>

		)}

		{!agents?.length &&
			<div className="jack-lbl-empty">NO AGENTS</div>
		}

	</div>
}

export default RoomAgentListReadForm
