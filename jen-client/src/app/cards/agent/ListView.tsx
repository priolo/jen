import FrameworkCard from "@/components/cards/FrameworkCard"
import { AgentDetailStore } from "@/stores/stacks/agent/detail"
import agentSo from "@/stores/stacks/agent/repo"
import { RoomAgentsListStore } from "@/stores/stacks/room/detail/agentsList"
import { AgentLlm } from "@/types/Agent"
import { AlertDialog, Button, IconToggle, OptionsCmp } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useMemo } from "react"
import EditorIcon from "../../../icons/EditorIcon"
import clsCard from "../CardCyanDef.module.css"



interface Props {
	store?: RoomAgentsListStore
}

const AgentListView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)
	useStore(store.state.group)
	useStore(agentSo)


	// HOOKs

	useEffect(() => {
		store.init()
	}, [])

	const { checked, unchecked } = useMemo(() => {
		const all = agentSo.state.all?.sort((c1, c2) => c1.name?.localeCompare(c2.name)) ?? []
		const { chacked, unchecked } = all?.reduce((acc, agent) => {
			if (store.state.selectedIds.includes(agent.id)) {
				acc.chacked.push(agent)
			} else {
				acc.unchecked.push(agent)
			}
			return acc
		}, { chacked: [] as AgentLlm[], unchecked: [] as AgentLlm[] }) ?? { chacked: [], unchecked: [] }
		return { checked: chacked, unchecked }
	}, [agentSo.state.all, store.state.selectedIds])


	// HANDLER
	const handleSelect = (agent: AgentLlm) => store.openDetail(agent.id)
	const handleNew = () => store.create()
	const handleDelete = () => store.delete(selectId)
	const handleToggle = (agent: AgentLlm, check: boolean) => {
		const selectedIds = !check
			? store.state.selectedIds.filter(id => id !== agent.id)
			: [...store.state.selectedIds, agent.id]
		store.setSelectedIds(selectedIds)
	}


	// RENDER
	const selectId = (store.state.linked as AgentDetailStore)?.state?.agent?.id
	const isSelected = (agent: AgentLlm) => agent.id == selectId
	const isChecked = (agent: AgentLlm) => store.state.selectedIds.includes(agent.id)

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
			{checked?.map((agent) => {
				return <div key={agent.id} style={{ display: "flex" }}>
					<IconToggle
						check={isChecked(agent)}
						onChange={(check) => handleToggle(agent, check)}
					/>
					<div
						onClick={(e) => handleSelect(agent)}
					>{agent.name} {isSelected(agent) ? "**" : ""}</div>
				</div>
			})}

			{!checked?.length &&
				<div className="jack-lbl-empty">NO AGENTS SELECTED</div>
			}



			<div className="jack-divider-h" />

			<div className="jack-lbl-prop">SELECTABLE</div>

			{unchecked?.map((agent) => {
				return <div key={agent.id} style={{ display: "flex" }}>
					<IconToggle
						check={isChecked(agent)}
						onChange={(check) => handleToggle(agent, check)}
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

export default AgentListView
