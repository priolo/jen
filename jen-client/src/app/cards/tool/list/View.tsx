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
	const items = useMemo(
		() => store.getList(),
		[store.state.textSearch, toolSo.state.all, store.state.items]
	)


	// HANDLER
	const handleSelect = (tool: ToolDTO) => store.detail(tool.id)


	// RENDER
	const selectId = (store.state.linked as ToolDetailStore)?.state?.toolId
	const isSelected = (item: ToolDTO) => item.id == selectId
	const isDisabled = (item: ToolDTO) => store.getParentList()?.some(t => t.id == item.id) ?? false

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

			{!items?.length && <div className="jack-lbl-empty">NO TOOLS</div>}

		</div>

		<AlertDialog store={store} />

	</FrameworkCard>
}

export default ToolListView
