import FrameworkCard from "@/components/cards/FrameworkCard"
import ElementRow from "@/components/rows/ElementRow"
import EditorIcon from "@/icons/EditorIcon"
import { ToolDetailStore } from "@/stores/stacks/tool/detail"
import { ToolListStore } from "@/stores/stacks/tool/list"
import toolSo from "@/stores/stacks/tool/repo"
import { AlertDialog, Button, OptionsCmp } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { ToolDTO } from "@shared/types/ToolDTO"
import { FunctionComponent, useDeferredValue, useMemo } from "react"
import clsCard from "../../CardCyanDef.module.css"
import ActionsCmp from "./Actions"



interface Props {
	store?: ToolListStore
}

const ToolListView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)
	//useStore(store.state.group)
	useStore(toolSo)


	// HOOKs
	const tools = useMemo(
		() => store.getList(),
		[store.state.textSearch, toolSo.state.all, store.state.tools]
	)


	// HANDLER
	const handleSelect = (tool: ToolDTO) => store.detail(tool.id)


	// RENDER
	const selectId = (store.state.linked as ToolDetailStore)?.state?.toolId
	const isSelected = (tool: ToolDTO) => tool.id == selectId
	const isDisabled = (tool: ToolDTO) => store.getParentList()?.some(t => t.id == tool.id) ?? false

	return <FrameworkCard
		className={clsCard.root}
		icon={<EditorIcon />}
		store={store}
		iconizedRender={null}
		actionsRender={<ActionsCmp store={store} />}
	>
		<div className={clsCard.content}>

			{tools?.map(tool =>
				<ElementRow key={tool.id}
					title={tool.name}
					selected={isSelected(tool)}
					disabled={isDisabled(tool)}

					onClick={() => handleSelect(tool)}
				/>
			)}

			{!tools?.length && <div className="jack-lbl-empty">NO TOOLS</div>}

		</div>

		<AlertDialog store={store} />

	</FrameworkCard>
}

export default ToolListView
