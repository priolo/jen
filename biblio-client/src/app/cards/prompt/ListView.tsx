import FrameworkCard from "@/components/cards/FrameworkCard"
import { PromptDetailStore } from "@/stores/stacks/prompt/detail"
import { PromptListStore } from "@/stores/stacks/prompt/list"
import { Prompt } from "@/types/Prompt"
import { AlertDialog, Button, OptionsCmp } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect } from "react"
import EditorIcon from "../../../icons/EditorIcon"
import clsCard from "../CardCyanDef.module.css"



interface Props {
	store?: PromptListStore
}

const PromptListView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)
	useStore(store.state.group)


	// HOOKs
	useEffect(() => {
		store.fetchIfVoid()
	}, [])


	// HANDLER
	const handleSelect = (prompt: Prompt) => store.select(prompt.id)
	const handleNew = () => store.create()
	const handleDelete = () => store.delete(selectId)


	// RENDER
	const selectId = (store.state.linked as PromptDetailStore)?.state?.prompt?.id
	const isSelected = (prompt: Prompt) => prompt.id == selectId
	const prompts = store.state.all

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
			{prompts?.map((prompt) => {
				return <div key={prompt.id} className={clsCard.item}>
					<div
						onClick={(e) => handleSelect(prompt)}
					>{prompt.name} {isSelected(prompt) ? "**" : ""}</div>
				</div>
			})}
		</div>

		<AlertDialog store={store} />

	</FrameworkCard>
}

export default PromptListView
