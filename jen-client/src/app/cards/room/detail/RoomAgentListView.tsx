import FrameworkCard from "@/components/cards/FrameworkCard"
import { AgentDetailStore } from "@/stores/stacks/agent/detail"
import agentSo from "@/stores/stacks/agent/repo"
import { RoomAgentsListStore } from "@/stores/stacks/room/detail/roomAgentsList"
import { AlertDialog, Button, IconToggle, OptionsCmp } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useMemo } from "react"
import EditorIcon from "../../../../icons/EditorIcon"
import clsCard from "../../CardCyanDef.module.css"
import { AgentDTO } from "@shared/types/AgentDTO"



interface Props {
	store?: RoomAgentsListStore
}

const RoomAgentListView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)
	useStore(store.state.group)
	useStore(agentSo)


	// HOOKs
	useEffect(() => {
		store.fetchIfVoid()
	}, [])

	const selectable = useMemo(() => store.getSelectableAgents(), [agentSo.state.all, store.state.agents])
	const selected = store.state.agents ?? []

	// HANDLER
	const handleSelect = (agent: AgentDTO) => store.openDetail(agent.id)
	const handleNew = () => store.create()
	const handleDelete = () => store.delete(selectId)
	const handleAdd = (agent: AgentDTO) => store.addAgent(agent)
	const handleRemove = (agent: AgentDTO) => store.removeAgent(agent)


	// RENDER
	const selectId = (store.state.linked as AgentDetailStore)?.state?.agent?.id
	const isSelected = (agent: AgentDTO) => agent.id == selectId
	const isChecked = (agent: AgentDTO) => null //store.state.selectedIds.includes(agent.id)

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

		<AlertDialog store={store} />

	</FrameworkCard>
}

export default RoomAgentListView
