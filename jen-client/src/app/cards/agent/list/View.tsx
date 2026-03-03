import FrameworkCard from "@/components/cards/FrameworkCard"
import ElementRow from "@/components/rows/ElementRow"
import EditorIcon from "@/icons/EditorIcon"
import { AgentListStore } from "@/stores/stacks/agent/list"
import agentSo from "@/stores/stacks/agent/repo"
import { AlertDialog } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { AgentDTO } from "@shared/types/AgentDTO"
import { FunctionComponent, useMemo } from "react"
import clsCard from "../../CardCyanDef.module.css"
import ActionsCmp from "./Actions"
import { AgentDetailStore } from "@/stores/stacks/agent/detail"



interface Props {
	store?: AgentListStore
}

const AgentListView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)
	useStore(agentSo)


	// HOOKs
	const items = useMemo(
		() => store.getList(),
		[store.state.textSearch, agentSo.state.all, store.state.items]
	)


	// HANDLER
	const handleSelect = (agent: AgentDTO) => store.detail(agent.id)


	// RENDER
	const selectId = (store.state.linked as AgentDetailStore)?.state?.agentId
	const isSelected = (item: AgentDTO) => item.id == selectId
	const isDisabled = (item: AgentDTO) => store.getParentList()?.some(t => t.id == item.id) ?? false

	return <FrameworkCard
		className={clsCard.root}
		icon={<EditorIcon />}
		store={store}
		iconizedRender={null}
		actionsRender={<ActionsCmp store={store} />}
	>
		<div className={clsCard.content}>

			{items?.map(item =>
				<ElementRow key={item.id}
					title={item.name}
					selected={isSelected(item)}
					disabled={isDisabled(item)}
					onClick={() => handleSelect(item)}
				/>
			)}

			{!items?.length && <div className="jack-lbl-empty">NO AGENTS</div>}

		</div>

		<AlertDialog store={store} />

	</FrameworkCard>
}

export default AgentListView
