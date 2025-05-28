import FrameworkCard from "@/components/cards/FrameworkCard"
import { AlertDialog, Button, OptionsCmp } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo } from "react"
import EditorIcon from "../../../icons/EditorIcon"
import clsCard from "../CardCyanDef.module.css"
import { AgentListStore } from "@/stores/stacks/agent/list"
import agentSo from "@/stores/stacks/agent/repo"
import { Agent } from "@/types/Agent"
import { AgentDetailStore } from "@/stores/stacks/agent/detail"



interface Props {
	store?: AgentListStore
}

const AgentListView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)
	useStore(store.state.group)
	useStore(agentSo)

	
	// HOOKs
	const agents = useMemo(() => {
		return agentSo.state.all//?.sort((c1, c2) => c1.name?.localeCompare(c2.name))
	}, [agentSo.state.all])


	// HANDLER
	const handleSelect = (agent: Agent) => store.select(agent.id)
	const handleNew = () => store.create()
	const handleDelete = () => store.delete(selectId)


	// RENDER
	const selectId = (store.state.linked as AgentDetailStore)?.state?.agent?.id
	const isSelected = (agent: Agent) => agent.id == selectId

	return <FrameworkCard
		className={clsCard.root}
		icon={<EditorIcon />}
		store={store}
		iconizedRender={null}
		actionsRender={<>
			<OptionsCmp
				style={{ marginLeft: 5, backgroundColor: "rgba(255,255,255,.4)" }}
				store={store}
				storeView={store}
			/>
			<div style={{ flex: 1 }} />
			{!!selectId && <Button
				children="DELETE"
				onClick={handleDelete}
			/>}
			{!!selectId && <div> | </div>}
			<Button
				children="NEW"
				//select={isNewSelect}
				onClick={handleNew}
			/>
		</>}
	>
		<div className={clsCard.content}>
			{agents?.map((agent) => {
				return <div key={agent.id} className={clsCard.item}>
					<div 
						onClick={(e) => handleSelect(agent)}
					>{agent.name} {isSelected(agent) ? "**": ""}</div>
				</div>
			})}
		</div>

		<AlertDialog store={store} />

	</FrameworkCard>
}

export default AgentListView
