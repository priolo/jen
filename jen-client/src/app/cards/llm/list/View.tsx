import FrameworkCard from "@/components/cards/FrameworkCard"
import ElementRow from "@/components/rows/ElementRow"
import { LlmListStore } from "@/stores/stacks/llm/list"
import llmSo from "@/stores/stacks/llm/repo"
import { AlertDialog } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { LlmDTO } from "@shared/types/LlmDTO"
import { FunctionComponent, useMemo } from "react"
import EditorIcon from "../../../../icons/EditorIcon"
import clsCard from "../../CardCyanDef.module.css"
import ActionsCmp from "./Actions"



interface Props {
	store?: LlmListStore
}

const LlmListView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)
	useStore(llmSo)


	// HOOKs
	const llms = useMemo(
		() => store.getList(),
		[store.state.textSearch, llmSo.state.all]
	)

	// HANDLER
	const handleSelect = (llm: LlmDTO) => store.detail(llm.id)


	// RENDER
	const selectedId = store.getSelected()

	return <FrameworkCard
		className={clsCard.root}
		icon={<EditorIcon />}
		store={store}
		iconizedRender={null}
		actionsRender={<ActionsCmp store={store} />}
	>
		<div className={clsCard.content}>

			{llms?.map(llm =>
				<ElementRow
					key={llm.id}
					onClick={() => handleSelect(llm)}
					selected={selectedId == llm.id}
					title={llm.code}
				/>
			)}

			{!llms?.length && <div className="jack-lbl-empty">NO LLMS</div>}

		</div>

		<AlertDialog store={store} />

	</FrameworkCard>
}

export default LlmListView
