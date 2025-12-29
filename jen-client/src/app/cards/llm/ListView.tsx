import FrameworkCard from "@/components/cards/FrameworkCard"
import { LlmListStore } from "@/stores/stacks/llm/list"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useEffect, useMemo } from "react"
import EditorIcon from "../../../icons/EditorIcon"
import clsCard from "../CardCyanDef.module.css"
import { AlertDialog, Button, IconButton, OptionsCmp } from "@priolo/jack"
import { Llm } from "@/types/Llm"
import llmSo from "@/stores/stacks/llm/repo"
import { LlmDetailStore } from "@/stores/stacks/llm/detail"



interface Props {
	store?: LlmListStore
}

const LlmListView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)
	useStore(store.state.group)
	useStore(llmSo)

	// HOOKs
	const llm = useMemo(() => {
		return llmSo.state.all//?.sort((c1, c2) => c1.name?.localeCompare(c2.name))
	}, [llmSo.state.all])

	// HANDLER
	const handleSelect = (llm: Llm) => store.select(llm.id)
	const handleNew = () => store.create()
	const handleDelete = () => store.delete(selectId)


	// RENDER
	const selectId = (store.state.linked as LlmDetailStore)?.state?.llm?.id
	const isSelected = (llm: Llm) => llm.id == selectId

	//const isNewSelect = consumersSa.linked?.state.type == DOC_TYPE.CONSUMER && (consumersSa.linked as ConsumerStore).state.editState == EDIT_STATE.NEW


	// const isNewSelect = cnnListSa.linked?.state.type == DOC_TYPE.CONNECTION && (cnnListSa.linked as CnnDetailStore).state.editState == EDIT_STATE.NEW
	// const selectId = (cnnListSa.linked as CnnDetailStore)?.state?.connection?.id
	// const isSelected = (cnn: Connection) => cnn.id == selectId
	// const isVoid = !(connections?.length > 0)
	// const loaderOpen = cnnListSa.linked?.state.type == DOC_TYPE.CNN_LOADER

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
			{llm?.map((llm) => {
				return <div key={llm.id} className={clsCard.item}>
					<div 
						onClick={(e) => handleSelect(llm)}
					>{llm.code} {isSelected(llm) ? "**": ""}</div>
				</div>
			})}
		</div>

		<AlertDialog store={store} />

	</FrameworkCard>
}

export default LlmListView
