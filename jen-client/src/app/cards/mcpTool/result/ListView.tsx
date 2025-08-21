import FrameworkCard from "@/components/cards/FrameworkCard"
import EditorIcon from "@/icons/EditorIcon"
import { ToolResultListStore } from "@/stores/stacks/mcpTool/resultList"
import toolResultsSo from "@/stores/stacks/mcpTool/resultsRepo"
import { AlertDialog } from "@priolo/jack"
import { useStore } from "@priolo/jon"
import { FunctionComponent, useMemo } from "react"
import clsCard from "../../CardCyanDef.module.css"
import ToolResultCmp from "../ToolResultCmp"
import ToolRequestCmp from "../ToolRequestCmp"



interface Props {
	store?: ToolResultListStore
}


/**
 * CARD che visualizza la lista dei risultati delle esecuzioni di uno specifico TOOL
 */
const ToolResultListView: FunctionComponent<Props> = ({
	store,
}) => {

	// STORE
	useStore(store)
	useStore(toolResultsSo)

	
	// HOOKs
	const toolMessages = useMemo(() => {
		return toolResultsSo.state.all
			.filter( (message => message.mcpServerId === store?.state.mcpServerId && message.mcpTool.name === store?.state.toolName))
	}, [toolResultsSo.state.all, store?.state.mcpServerId])


	// HANDLER


	// RENDER

	return <FrameworkCard
		className={clsCard.root}
		icon={<EditorIcon />}
		store={store}
		iconizedRender={null}
		actionsRender={<></>}
	>
		<div className={clsCard.content}>
			{toolMessages?.map((message, index) => {
				return <div key={index} className={clsCard.item}>
					
					<div>{message.mcpTool.name}</div>
					
					<ToolRequestCmp
						request={message.request}
					/>

					{message.response?.content?.map((content, idx) => (
						<ToolResultCmp
							key={idx}
							content={content}
						/>
					))}

				</div>
			})}
		</div>

		<AlertDialog store={store} />

	</FrameworkCard>
}

export default ToolResultListView


