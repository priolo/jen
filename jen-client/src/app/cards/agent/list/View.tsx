import FrameworkCard from "@/components/cards/FrameworkCard"
import ElementRow from "@/components/rows/ElementRow"
import EditorIcon from "@/icons/EditorIcon"
import { AgentListStore } from "@/stores/stacks/agent/list"
import agentSo from "@/stores/stacks/agent/repo"
import { AlertDialog } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { AgentDTO } from "@shared/types/AgentDTO"
import { FunctionComponent } from "react"
import clsCard from "../../CardCyanDef.module.css"
import ActionsCmp from "./Actions"



interface Props {
	store?: AgentListStore
}

const AgentListView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)
	useStore(agentSo)
	//useStore(store.state.group)


	// HOOKs


	// HANDLER
	const handleSelect = (agent: AgentDTO) => store.detail(agent.id)


	// RENDER
	const agents = agentSo.state.all ?? []
	const selectedId = store.getSelected()
	

	return <FrameworkCard
		className={clsCard.root}
		icon={<EditorIcon />}
		store={store}
		iconizedRender={null}
		actionsRender={<ActionsCmp store={store} />}
	>
		<div className={clsCard.content}>

			{agents?.map((agent) =>
				<ElementRow
					key={agent.id}
					onClick={() => handleSelect(agent)}
					selected={selectedId == agent.id}
					title={agent.name}
					//subtitle={account.email}
				/>
			)}

			{!agents?.length &&
				<div className="jack-lbl-empty">NO AGENTS</div>
			}

		</div>

		<AlertDialog store={store} />

	</FrameworkCard>
}

export default AgentListView
