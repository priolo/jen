import FrameworkCard from "@/components/cards/FrameworkCard"
import { McpServerDetailStore } from "@/stores/stacks/mcpServer/detail"
import { McpServerListStore } from "@/stores/stacks/mcpServer/list"
import mcpServerSo from "@/stores/stacks/mcpServer/repo"
import { McpServer } from "@/types/McpServer"
import { AlertDialog, Button, OptionsCmp } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo } from "react"
import EditorIcon from "@/icons/EditorIcon"
import clsCard from "../CardCyanDef.module.css"



interface Props {
	store?: McpServerListStore
}

const ToolResponseListView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)
	useStore(store.state.group)
	useStore(mcpServerSo)

	// HOOKs
	const mcpServers = useMemo(() => {
		return mcpServerSo.state.all//?.sort((c1, c2) => c1.name?.localeCompare(c2.name))
	}, [mcpServerSo.state.all])

	// HANDLER
	const handleSelect = (mcpServer: McpServer) => store.select(mcpServer.id)
	const handleNew = () => store.create()
	const handleDelete = () => store.delete(selectId)


	// RENDER
	const selectId = (store.state.linked as McpServerDetailStore)?.state?.mcpServer?.id
	const isSelected = (mcpServer: McpServer) => mcpServer.id == selectId

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
			{mcpServers?.map((mcpServer) => {
				return <div key={mcpServer.id} className={clsCard.item}>
					<div 
						onClick={(e) => handleSelect(mcpServer)}
					>{mcpServer.name} {isSelected(mcpServer) ? "**": ""}</div>
				</div>
			})}
		</div>

		<AlertDialog store={store} />

	</FrameworkCard>
}

export default ToolResponseListView
