import FrameworkCard from "@/components/cards/FrameworkCard"
import { AlertDialog, Button, OptionsCmp } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo } from "react"
import EditorIcon from "../../../icons/EditorIcon"
import clsCard from "../CardCyanDef.module.css"
import { ToolListStore } from "@/stores/stacks/tool/list"
import toolSo from "@/stores/stacks/tool/repo"
import { Tool } from "@/types/Tool"
import { ToolDetailStore } from "@/stores/stacks/tool/detail"



interface Props {
	store?: ToolListStore
}

const ToolListView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)
	useStore(store.state.group)
	useStore(toolSo)

	
	// HOOKs
	const tools = useMemo(() => {
		return toolSo.state.all//?.sort((c1, c2) => c1.name?.localeCompare(c2.name))
	}, [toolSo.state.all])


	// HANDLER
	const handleSelect = (tool: Tool) => store.select(tool.id)
	const handleNew = () => store.create()
	const handleDelete = () => store.delete(selectId)


	// RENDER
	const selectId = (store.state.linked as ToolDetailStore)?.state?.tool?.id
	const isSelected = (tool: Tool) => tool.id == selectId

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
			{tools?.map((tool) => {
				return <div key={tool.id} className={clsCard.item}>
					<div 
						onClick={(e) => handleSelect(tool)}
					>{tool.name} {isSelected(tool) ? "**": ""}</div>
				</div>
			})}
		</div>

		<AlertDialog store={store} />

	</FrameworkCard>
}

export default ToolListView
