import FrameworkCard from "@/components/cards/FrameworkCard"
import EditorIcon from "@/icons/EditorIcon"
import { ToolResponseListStore } from "@/stores/stacks/mcpTool/responseList"
import { ToolMessage } from "@/stores/stacks/mcpTool/types"
import { AlertDialog } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo } from "react"
import clsCard from "../../CardCyanDef.module.css"



interface Props {
	store?: ToolResponseListStore
}

const ToolResponseListView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)
	//useStore(store.state.group)

	
	// HOOKs
	const toolMessages = useMemo(() => {
		return store.state.all
	}, [store.state.all])


	// HANDLER


	// RENDER
	const isSelected = (message: ToolMessage ) => false
	// const isNewSelect = consumersSa.linked?.state.type == DOC_TYPE.CONSUMER && (consumersSa.linked as ConsumerStore).state.editState == EDIT_STATE.NEW
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
		actionsRender={<></>}
	>
		<div className={clsCard.content}>
			!!!CIAO!!!
			{toolMessages?.map((response, index) => {
				return <div key={index} className={clsCard.item}>
					<div 
						//onClick={(e) => handleSelect(response)}
					>{response.mcpTool.name} {isSelected(response) ? "**": ""}</div>
				</div>
			})}
		</div>

		<AlertDialog store={store} />

	</FrameworkCard>
}

export default ToolResponseListView
